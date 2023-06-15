const express = require('express');
const http = require('http');
const winston = require('winston');

const mysql = require('mysql');
const socketIO = require('socket.io');

const bcrypt = require("bcrypt") // Importing bcrypt package
const passport = require("passport")
const LocalStrategy = require('passport-local').Strategy;

const session = require("express-session");
const cookieParser = require('cookie-parser');

const { connect } = require('http2');
const fernet = require('fernet');
const { darkScrollbar } = require('@mui/material');

const cors = require('cors');



// Remove the default Console log transport
winston.remove(winston.transports.Console);
// Add a Console log transport with color and timestamp options
winston.add(new winston.transports.Console({ colorize: true, timestamp: true }));
// Print log information
winston.info('SocketIO > listening on port 3001');


const app = express();

// 解析 JSON 数据
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
// 使用中间件处理Cookie和会话
app.use(cookieParser());

app.use(express.urlencoded({extended: false}))
// app.use(flash())


// Create  store_login database connection configuration
const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'store_login',
};


// 创建MySQL数据库连接
const user_connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'user_login',
});

// 连接到MySQL数据库
user_connection.connect((error) => {
  if (error) {
    console.error('Error connecting to the database:', err);
    reject(error);
  } 
});

// 配置 Passport 策略
passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    // 查询用户凭据
    const query = 'SELECT * FROM customer WHERE email = ?';
    user_connection.query(query, [email], (error, results) => {
      if (error) {
        
        return done(error);
      }
      if (results.length === 0) {
        // 用户不存在
        return done(null, false);
      }
      const user = results[0];

      // 验证密码
      bcrypt.compare(password, user.password, (error, isMatch) => {
        if (error) {
          
          return done(err);
        }
        if (isMatch) {
          // 密码匹配
          return done(null, user);
        } else {
          // 密码不匹配
          return done(null, false);
        }
      });
    });
   
  })
);


// 初始化 Passport
app.use(
  session({
    // store: new RedisStore({ client: redisClient }),
    secret: 'your-secret-key', // 设置用于加密会话数据的秘密密钥
    resave: false, // 是否在每个请求上保存会话数据
    saveUninitialized: false, // 是否自动保存未初始化的会话数据
    cookie: { httpOnly: true, secure: false, maxAge: 3600000 }
  })
);

app.use(passport.initialize()) 
app.use(passport.session())

// 序列化和反序列化用户
passport.serializeUser((user, done) => {
  done(null, user.cus_id);
});

passport.deserializeUser((cus_id, done) => {
  
  const query = 'SELECT * FROM customer WHERE cus_id = ?';
  user_connection.query(query, [cus_id], (error, results) => {
    if (error) {
      
      return done(error);
    }
    //console.log('Deserialized user:', results[0]); // 添加调试语句
    done(null, results[0]);
  });
});


app.get('/user', (req, res) => {
  
  if (req.isAuthenticated()) {
      
      res.json(req.user);
  } else {
      res.status(401).json({ message: 'Not authenticated' });
  }
});


// 处理登录请求
app.post('/login', passport.authenticate('local'), (req, res) => {
  // 登录成功处理
  
  req.session.userId = req.user.cus_id;
  
  
    // 存储会话ID到客户端的Cookie中
  res.cookie('sessionId', req.sessionID, { sameSite: 'none', secure: true });

    // 设置允许携带Cookie的响应头
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // 客户端的URL
  

   // 关闭数据库连接
   //user_connection.end();
  res.json({ message: 'Login successful' });
});


app.post("/register", async (req, res) => {
  try {
    const acti_connectionConfig = {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'activation_keys',
    };
    const acti_connection = mysql.createConnection(acti_connectionConfig);

    // Connect to the database
    acti_connection.connect((error) => {
      if (error) {
        console.error('Error connecting to the database:', error);
        
      }
    });

    const { activationKey, email, password } = req.body;

    const activationQuery = 'SELECT * FROM activation_keys WHERE key_data = ?';
    const hashedPassword = await bcrypt.hash(password, 10);

    acti_connection.query(activationQuery, [activationKey], (activationError, activationResults) => {
      if (activationError) {
        acti_connection.end();
        return res.status(500).json({ error: 'An error occurred while verifying the activation key' });
      }
      if (activationResults.length === 0) {
        acti_connection.end();
        return res.status(400).json({ message: 'Invalid activation key' });
      }

      const insertQuery = 'INSERT INTO customer (email, password) VALUES (?, ?)';
      user_connection.query(insertQuery, [email, hashedPassword], (insertError, insertResults) => {
        if (insertError) {
         
          acti_connection.end();
          return res.status(500).json({ error: 'An error occurred while registering the user' });
        }

        const activationDeleteQuery = 'DELETE FROM activation_keys WHERE key_data = ?';
        acti_connection.query(activationDeleteQuery, [activationKey], (deleteError, deleteResults) => {
          if (deleteError) {
            console.log(deleteError);
            acti_connection.end();
            return res.status(500).json({ error: 'An error occurred while deleting the activation key' });
          }

          res.status(200).json({ message: 'Registration successful' });
          console.log(req.body);

          // Close the acti_connection connection
          acti_connection.end();
        });
      });
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while registering the user' });
  }
});


const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

function update_socket_sql(store_id, socket_id) {
  const connection = mysql.createConnection(connectionConfig);

  // Connect to the database
  connection.connect((error) => {
    if (error) {
      console.error('Error connecting to the database:', error);
      reject(error);
    }
  });
 
  // const table = 'store_' + store_id;
  const selectQuery = `SELECT store_id FROM stores WHERE store_id = ?`;

  new Promise((resolve, reject) => {
    connection.query(selectQuery, [store_id], (error, results) => {
      if (error) {
        console.error('Error executing SELECT query:', error);
        reject(error);
      } else {
        if (results.length > 0) {
          const updateQuery = `UPDATE stores SET client_socket_id = ? WHERE store_id = ?`;
          connection.query(updateQuery, [socket_id, store_id], (error, results) => {
            if (error) {
              console.error('Error executing UPDATE query:', error);
              reject(error);
            } else {
              console.log(`Updated record with ID ${store_id}`);
              resolve();
            }
          });
        } else {
          const insertQuery = `INSERT INTO stores (store_id, client_socket_id) VALUES (?, ?)`;
          connection.query(insertQuery, [store_id, socket_id], (error, results) => {
            if (error) {
              console.error('Error executing INSERT query:', error);
              reject(error);
            } else {
              console.log(`Inserted record with ID ${store_id}`);
              resolve();
            }
          });
        }
      }
    });
  })
    .then(() => {
      console.log('All queries executed successfully');
      connection.end();
    })
    .catch((error) => {
      console.error('Error occurred:', error);
      connection.end();
    });
}

function find_client_socket(store_id) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(connectionConfig);

    // Connect to the database
    connection.connect((error) => {
      if (error) {
        console.error('Error connecting to the database:', error);
        reject(error);
      }
    });
    
    // const table = 'store_' + store_id;
    const selectQuery = `SELECT client_socket_id FROM stores WHERE store_id = ?`;
    connection.query(selectQuery, [store_id], (error, results) => {
      if (error) {
        console.error('Error executing SELECT query:', error);
        reject(error);
      } else {
        if (results.length > 0) {
          resolve(results[0].client_socket_id);
        } else {
          resolve(null);
        }
      }
    });

    connection.end();
  });
}

function listenserver(server) {
  const webpage = new Map();

  io.on('connection', function (socket) {
    // Store webpage socket ID and connection details
    socket.on('message', function (data) {
      console.log(data);
    });
    winston.info('SocketIO > Connected socket ' + socket.id);

    // Listen for fetchData event
    socket.on('fetchData', async function (data) {
      try {
        const clientSocketId = await find_client_socket(data.store_id);

        if (clientSocketId) {
          const clientSocket = io.sockets.sockets.get(clientSocketId);
          if (clientSocket) {
            console.log('Sending query to client socket:', clientSocketId);

            // Check if data.store_id exists in webpage
            if (webpage.has(data.store_id)) {
              // Update the socketId for the existing entry
              const existingData = webpage.get(data.store_id);
              existingData.socketId = socket.id;
              console.log('Updated webpage entry:', existingData);
            } else {
              // Store socket ID, data.store_id, and connection time in webpage object
              webpage.set(data.store_id, {
                socketId: socket.id,
                storeId: data.store_id,
              });
              console.log('Stored data in webpage:', webpage.get(data.store_id));
            }
            // Send the query to the client socket
            clientSocket.emit('fetchData', data);
          } else {
            console.log('Client socket not found for socket ID:', clientSocketId);
          }
        } else {
          console.log('Client socket ID not found for store:', data.store_id);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });

    socket.on('disconnect', function () {
      winston.info('SocketIO > Disconnected socket ' + socket.id);
      // Get the disconnected webpage socket ID
      const disconnectedSocketId = socket.id;

      // Find the webpage entity based on its socket ID
      let disconnectedWebpage;
      webpage.forEach((webpage) => {
        if (webpage.socketId === disconnectedSocketId) {
          disconnectedWebpage = webpage;
        }
      });

      if (disconnectedWebpage) {
        // Delete the webpage entity from the map
        webpage.delete(disconnectedWebpage.storeId);
        console.log('Deleted webpage:', disconnectedWebpage);
      }
    });

    socket.on('login', function (data) {
      // data = store_id
      update_socket_sql(data, socket.id);
    });

    socket.on('sendData', function (data) {
      
  //     console.log(typeof data)
    
  //       // 解密密钥
  //     const key = 'w5Y6dmQ0XMdFnAHp5U9moxv6oUkaTQNAwE3YIFLDnZ0=';


  //     // 检查数据是否是Buffer，如果是，将其转换为base64字符串
  //   if (Buffer.isBuffer(data)) {
  //     data = data.toString('base64');
  // }

  // // 确保数据是字符串类型
  // if (typeof data !== 'string') {
  //     console.error('Received data is not a string:', data);
  //     return;
  // }

  

  // // 记录接收到的加密数据
  // console.log('Received encrypted data (base64):', data);

  // // 尝试将base64字符串转换回字节
  // let encrypted_data;
  // try {
  //     encrypted_data = Buffer.from(data, 'base64');
  // } catch (err) {
  //     console.error('Error decoding base64:', err);
  //     return;
  // }

  // let secret = new fernet.Secret(key);
  
  // let token;
  // try {
  //     token = new fernet.Token({secret: secret, token: data, ttl: 0});
  // } catch (err) {
  //     console.error('Error creating Fernet token:', err);
  //     return;
  // }

  // let decryptedData;
  // try {
  //     decryptedData = token.decode();
  // } catch (err) {
  //     console.error('Error decrypting data:', err);
  //     return;
  // }

  // console.log('Decrypted data:', decryptedData);
      
  //     console.log(decryptedData);
  //     console.log(data)

      const storeId = data[0][0];

      const existingData = webpage.get(storeId);
      if (existingData.socketId) {
        const clientSocket = io.sockets.sockets.get(existingData.socketId);
        if (clientSocket) {
          console.log('Sending data to web socket:', existingData.socketId);
          clientSocket.emit('dashboard_data', data);
        } else {
          console.log('No socket found with socket ID:', existingData.socketId);
        }
      } else {
        console.log('No socket found with store_id:', storeId);
      }
    });
  });
}

listenserver(server);

// 启动服务器
server.listen(3001, () => {
  console.log('Server is running on port 3001');
});
