const express = require('express');
const http = require('http');
const winston = require('winston');

const mysql = require('mysql');
const socketIO = require('socket.io');

const bcrypt = require("bcrypt") // Importing bcrypt package
const passport = require("passport")
// const initializePassport = require("./passport-config")
// const flash = require("express-flash")
const session = require("express-session")


// Remove the default Console log transport
winston.remove(winston.transports.Console);
// Add a Console log transport with color and timestamp options
winston.add(new winston.transports.Console({ colorize: true, timestamp: true }));
// Print log information
winston.info('SocketIO > listening on port 3001');

const app = express();

// initializePassport(
//   passport,
//   email => users.find(user => user.email === email),
//   id => users.find(user => user.id === id)
//   )
const users = []
app.use(express.urlencoded({extended: false}))
// app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, // We wont resave the session variable if nothing is changed
  saveUninitialized: false
}))
app.use(passport.initialize()) 
app.use(passport.session())
// 连接到MySQL数据库
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

// 初始化 Passport
initializePassport(
  passport,
  (email) => {
    // 通过邮箱查找用户
    const query = 'SELECT * FROM users WHERE email = ?';
    return new Promise((resolve, reject) => {
      connection.query(query, [email], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  },
  // (id) => {
  //   // 通过用户ID查找用户
  //   const query = 'SELECT * FROM users WHERE id = ?';
  //   return new Promise((resolve, reject) => {
  //     connection.query(query, [id], (err, results) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve(results[0]);
  //       }
  //     });
  //   });
  // }
);


const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Configure session middleware
app.use(
  session({
    secret: 'your-secret-key', // Set the session secret key used to encrypt session data
    resave: false, // Whether to save the session data on each request
    saveUninitialized: false, // Whether to automatically save uninitialized session data
  })
);

app.post('/login', passport.authenticate('local'), (req, res) => {
  // 登录成功处理
 

  // 关闭数据库连接
  connection.end();
});

function update_socket_sql(store_id, socket_id) {
  // Create database connection configuration
  const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'store_login',
  };
  const connection = mysql.createConnection(connectionConfig);

  // Connect to the database
  connection.connect((error) => {
    if (error) {
      console.error('Error connecting to the database:', error);
      return;
    }
  });

  const table = 'store_' + store_id;
  const selectQuery = `SELECT store_id FROM ${table} WHERE store_id = ?`;

  new Promise((resolve, reject) => {
    connection.query(selectQuery, [store_id], (error, results) => {
      if (error) {
        console.error('Error executing SELECT query:', error);
        reject(error);
      } else {
        if (results.length > 0) {
          const updateQuery = `UPDATE ${table} SET client_socket_id = ? WHERE store_id = ?`;
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
          const insertQuery = `INSERT INTO ${table} (store_id, client_socket_id) VALUES (?, ?)`;
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
    // Create database connection configuration
    const connectionConfig = {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'store_login',
    };
    const connection = mysql.createConnection(connectionConfig);

    // Connect to the database
    connection.connect((error) => {
      if (error) {
        console.error('Error connecting to the database:', error);
        reject(error);
      }
    });

    const table = 'store_' + store_id;
    const selectQuery = `SELECT client_socket_id FROM ${table} WHERE store_id = ?`;
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
