const express = require('express');
const http = require('http');
const winston = require('winston');

// const mysql = require('mysql');
const mysql = require('mysql2/promise');
const util = require('util');

const jwt = require('jsonwebtoken');

const jwtVerify = util.promisify(jwt.verify);

const socketIO = require('socket.io');

const bcrypt = require("bcrypt") // Importing bcrypt package
const crypto = require('crypto');

const passport = require("passport")
const LocalStrategy = require('passport-local').Strategy;

const session = require("express-session");
const { v4: uuidv4 } = require('uuid');
// const cookieParser = require('cookie-parser');

const { connect } = require('http2');
const fernet = require('fernet');
const { darkScrollbar } = require('@mui/material');

const cors = require('cors');
const { Console } = require('console');
const moment = require('moment');


const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });


//https
const fs = require('fs');
const https = require('https');

// 读取证书文件
const privateKey  = fs.readFileSync("C:/Users/shanu/OneDrive/Desktop/enrichpos_com_au/apache/enrichpos_com_au.key", 'utf8');
const certificate = fs.readFileSync("C:/Users/shanu/OneDrive/Desktop/enrichpos_com_au/apache/enrichpos_com_au.pem", 'utf8');
const ca = fs.readFileSync('C:/Users/shanu/OneDrive/Desktop/enrichpos_com_au/apache/ca.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };

// Remove the default Console log transport
winston.remove(winston.transports.Console);
// Add a Console log transport with color and timestamp options
winston.add(new winston.transports.Console({ colorize: true, timestamp: true }));

const app = express();

// 解析数据
// 只处理 Content-Type 为 text/plain 的请求
app.use(express.text({ type: 'text/plain' }));

// 只处理 Content-Type 为 application/json 的请求
app.use(express.json({ type: 'application/json' }));



// app.use(cors({
//   origin: '*', // 指定接受请求的源
//   credentials: true,  // 允许跨域携带凭证
// }));
app.use(cors({
  origin: 'http://enrichpos.com.au:3000', // 指定接受请求的源
  credentials: true,  // 允许跨域携带凭证
}));



// // 使用中间件处理Cookie和会话
// app.use(cookieParser());

app.use(express.urlencoded({extended: false}))

app.use(
  session({
    // store: new RedisStore({ client: redisClient }),
    secret: 'your-secret-key', // 设置用于加密会话数据的秘密密钥
    resave: false, // 是否在每个请求上保存会话数据
    saveUninitialized: false, // 是否自动保存未初始化的会话数据
    cookie: { httpOnly: true, secure: false, maxAge:  60 * 60 * 1000 } // 设置session有效期为1小时
  })
);

// // // 在所有其他中间件和路由之前添加此中间件
// app.use((req, res, next) => {
//   // 记录请求的方法、URL 和头部
//   // winston.info(`HTTP Request: ${req.method} ${req.url}`);
//   // winston.info(`Headers: ${stringify(req.headers)}`);
//   // 如果需要，你也可以记录请求体
//   winston.info(`Body: ${toString(req.body)}`);
//   next(); 
// });


// 创建连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10, // 连接池大小，根据需要调整
  queueLimit: 0,
});

async function executeDb(query, values = null, options = { fetchAll: false, fetchOne: false, commit: false }) {
  const connection = await pool.getConnection(); // 从连接池中获取连接
  const queryTrimmedUpper = query.trim().toUpperCase();

  // 检查是否是 INSERT、UPDATE 或 DELETE 操作，并根据需要开始事务
  if (queryTrimmedUpper.startsWith('INSERT') || queryTrimmedUpper.startsWith('UPDATE') || queryTrimmedUpper.startsWith('DELETE')) {
    await connection.beginTransaction(); // 开始事务
  }

  try {
    const [results] = await connection.query(query, values);

    // 如果是 INSERT、UPDATE 或 DELETE 操作，则提交事务
    if (queryTrimmedUpper.startsWith('INSERT') || queryTrimmedUpper.startsWith('UPDATE') || queryTrimmedUpper.startsWith('DELETE')) {
      await connection.commit();
    }

    if (options.fetchAll) {
      return results;
    } else if (options.fetchOne) {
      return results[0];
    } else {
      return results;
    }
  } catch (error) {
    // 如果是 INSERT、UPDATE 或 DELETE 操作并出错，则回滚事务
    if (queryTrimmedUpper.startsWith('INSERT') || queryTrimmedUpper.startsWith('UPDATE') || queryTrimmedUpper.startsWith('DELETE')) {
      await connection.rollback();
    }
    throw error;
  } finally {
    connection.release(); // 释放连接回连接池
  }
}


// 配置 Passport 策略
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      // 查询用户凭据
      
      const query = 'SELECT * FROM customers WHERE email = ?';
      const results = await executeDb(query, [email], { fetchAll: true });

      if (results.length === 0) {
        // 用户不存在
        return done(null, false);
      }
      const user = results[0];
      // 验证密码
      bcrypt.compare(password, user.password, (error, isMatch) => {
        if (error) {
          return done(error);
        }

        if (isMatch) {
          return done(null, user);
        } else {
          // 密码不匹配
          return done(null, false);
        }
      });
    } catch (error) {
      console.error('Error connecting to the database:', error);
      return done(error);
    }
  })
);


// 初始化 Passport
app.use(passport.initialize()) 
app.use(passport.session())

// 序列化和反序列化用户
passport.serializeUser((user, done) => {
  done(null, user.cus_id);
});

passport.deserializeUser(async (cus_id, done) => {
  try {
    const query = 'SELECT * FROM customers WHERE cus_id = ?';
    const results = await executeDb(query, [cus_id], { fetchAll: true });

    if (results.length > 0) {
      const user = results[0];

      // 获取 StoreId
      const storeQuery = 'SELECT StoreId FROM customer_store WHERE cus_id = ?';
      const storeResults = await executeDb(storeQuery, [user.cus_id], { fetchAll: true });

      // 将 StoreId 添加到用户对象
      user.store_ids = storeResults.length > 0 ? storeResults.map(result => result.StoreId) : null;

      done(null, user);
    } else {
      done(null, false); // 用户不存在
    }
  } catch (error) {
    console.error('Error connecting to the database:', error);
    return done(error);
  }
});


// POST /checkStores
app.post('/checkStores', (req, res) => {
  const origin_token = req.headers['authorization'];  // 打印所有请求头，以便调试
  const token = origin_token.split(' ')[1]; // 获取 JWT Token
  // 验证并解码 JWT
  jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const storeIds = decoded.storeIds; // 从载荷中获取 storeIds
    const selectedStoreId = decoded.selectedStoreId; // 从载荷中获取 selectedStoreId

    if (selectedStoreId && storeIds.includes(selectedStoreId)) {
      return res.status(200).json({ success: true});
    }
  
   else if(storeIds){
      // 如果有多个 storeId，从数据库中获取所有相关的商店名称
      try {
        const query = 'SELECT StoreName FROM stores WHERE StoreId IN (?)';
        const results = await executeDb(query, [storeIds], { fetchAll: true });
        return res.status(201).json({ success: true, stores: results});
      } catch (error) {
        console.error('Error querying stores table:', error);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
   }
    else {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
   
  });
});


const userCallbacks = {};
app.get('/dashboard',(req, res) => {
    try {
      
      const origin_token = req.headers['authorization'];  // 打印所有请求头，以便调试
      const token = origin_token.split(' ')[1]; // 获取 JWT Token
      // 验证并解码 JWT
      jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
        if (err) {
          return res.status(401).json({ success: false, message: 'Invalid token' });
        }
    
      const storeIds = decoded.storeIds; // 从载荷中获取 storeIds
      const selectedStoreId = decoded.selectedStoreId; // 从载荷中获取 selectedStoreId
      
      if (selectedStoreId && storeIds.includes(selectedStoreId)) {
        
        const pos_version_query = 'SELECT PosVersion FROM stores WHERE StoreId = (?)';
        const pos_version_results = await executeDb(pos_version_query, [selectedStoreId], { fetchAll: true });
        const options = { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' };
        const currentDate = new Date().toLocaleDateString('en-CA', options);
        let query;
        if (pos_version_results[0].PosVersion == '1') {
          query = 'SELECT * FROM report_records_h WHERE StoreId = ? AND Date = ?';
        } else {
          query = 'SELECT * FROM report_records_r WHERE StoreId = ? AND Date = ?';
        }
        const results = await executeDb(query, [selectedStoreId, currentDate], { fetchAll: true });
        // 初始化一个空对象来保存整理后的数据
        const dataWithDate = {};
        if (results.length === 0) {
          dataWithDate[currentDate] = {};
        } else {
          results.forEach(item => {
            // 从每个项目中解构出 RecordId 和 StoreId，然后获取其余的数据
            const { RecordId, StoreId, Date, ...rest } = item;
            // 使用日期作为键，并将其余的数据作为值
            dataWithDate[item.Date] = rest;
          });
        }
        res.status(200).json({
          message: 'success',
          results: dataWithDate,
          isAdmin: false
        });
      };
    });
    } catch (error) {
      console.error('Error querying customer_store table:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});


// 定义一个异步函数
const fetchData = async (selectedDate, tselectedDate, posVersionQuery, jwtToken) => {
  try {
    const decoded = await jwtVerify(jwtToken, process.env.JWT_SECRET_KEY);

    const storeIds = decoded.storeIds;
    const selectedStoreId = decoded.selectedStoreId;

    if (selectedStoreId && storeIds.includes(selectedStoreId)) {
      const pos_version_results = await executeDb(posVersionQuery, [selectedStoreId], { fetchAll: true });
      let query;
      if (pos_version_results[0].PosVersion === '1') {
            // 获取表的所有列名
        const columnQuery = "SHOW COLUMNS FROM report_records_h";
        const columns = await executeDb(columnQuery, [], { fetchAll: true });
        // 剔除不需要的前三列
        const filteredColumns = columns.slice(3).map(column => column.Field);
        // 构建 SQL 查询
        const sumColumns = filteredColumns.map(col => `ROUND(SUM(${col}), 2) AS ${col}`).join(', ');
        query = `SELECT ${sumColumns} FROM report_records_h WHERE StoreId = ? AND Date >= ? AND Date <= ?`;
        
      } else {
           const columnQuery = "SHOW COLUMNS FROM report_records_r";
           const columns = await executeDb(columnQuery, [], { fetchAll: true });
           const filteredColumns = columns.slice(3).map(column => column.Field);
           const sumColumns = filteredColumns.map(col => `ROUND(SUM(${col}), 2) AS ${col}`).join(', ');
           query = `SELECT ${sumColumns} FROM report_records_r WHERE StoreId = ? AND Date >= ? AND Date <= ?`;
           
      }
      const results = await executeDb(query, [selectedStoreId, selectedDate,tselectedDate], { fetchAll: true });
      const dataWithDate = {};
      const dateRangeKey = `${selectedDate} - ${tselectedDate}`;

      if (results.length === 0) {
        dataWithDate[dateRangeKey] = {};
      } else {
        dataWithDate[dateRangeKey] = results;
      }
      

      return { status: 200, data: { message: 'success', results: dataWithDate, isAdmin: false } };
    } else {
      return { status: 400, data: { message: 'Invalid store id' } };
    }
  } catch (error) {
    console.error('Error querying customer_store table:', error);
    return { status: 500, data: { message: 'Internal server error' } };
  }
};

// 在你的路由处理器中使用这个函数
app.get('/searchreport', async (req, res) => {
  const fselected = req.query.fselected;
  const fcompared = req.query.fcompared;
  const tselected = req.query.tselected;
  const tcompared = req.query.tcompared;

  const origin_token = req.headers['authorization'];
  const token = origin_token.split(' ')[1];

  const pos_version_query = 'SELECT PosVersion FROM stores WHERE StoreId = ?';

  if (fcompared === "" && tcompared === "" && fselected !== "" && tselected !== "") {
    const result = await fetchData(fselected, tselected, pos_version_query, token);

    res.status(200).json({
      message: 'success',
      results: [result.data.results],
      isAdmin: false
    });
  } else if (fselected !== "" && fcompared !== "" && tselected !== "" && tcompared !== "") {
    const fselectedResult = await fetchData(fselected,tselected, pos_version_query, token);
    const fcomparedResult = await fetchData(fcompared, tcompared, pos_version_query, token);

    if (fselectedResult.status===200 && fcomparedResult.status===200) {

      res.status(200).json({
        message: 'success',
        results: [fselectedResult.data.results,
          fcomparedResult.data.results],
        isAdmin: false
      });
    } else {
      res.status(400).json({ message: 'Invalid store id' });
    }
  }
});


// app.get('/user', async (req, res) => {
//   if (req.isAuthenticated() && req.user.email !== 'admin@lotus.com.au') {
//     try {
//       const cus_Id = req.user.cus_id;
//       const query = 'SELECT StoreId FROM customer_store WHERE cus_id = ?';
      
//       const results = await new Promise((resolve, reject) => {
//         const userDB = mysql.createConnection({
//           host: 'localhost',
//           user: 'root',
//           password: '',
//           database: 'online_report',
//         });
        
//         // 连接到MySQL数据库
//         userDB.connect((error) => {
//           if (error) {
//             console.error('Error connecting to the database:', err);
//             reject(error);
//           } 
//         });
//         userDB.query(query, [cus_Id], (error, results) => {
//           if (error) {
//             reject(error);
//           } else {
//             resolve(results);
//           }
//         });
//         userDB.end();
//       });

//       if (results.length === 0) {
//         return res.status(404).json({ message: 'Store not found' });
//       }

//       const data = {
//         store_id: results[0].store_id.toString(),
//         date1: null, 
//         date2: null,
//         type: 'dashboard',
//       };

//       const clientSocketId = await find_client_socket(data.store_id);
//       if (clientSocketId) {
//         const clientSocket = io.sockets.sockets.get(clientSocketId);
//         if (clientSocket) {

//             // 为当前请求生成唯一标识符
//             const requestId = uuidv4();

//             // 创建一个 Promise 以等待客户端发送数据
//             const dataPromise = new Promise((resolve) => {
//               // 将 Promise 的解析函数保存到 userCallbacks 字典中
//               userCallbacks[requestId] = resolve;
//             });

//             // 发送 'fetchData' 事件给客户端，并传递 requestId
//             clientSocket.emit('fetchData', data, requestId);
//             // 等待 Promise 解析后，将接收到的数据添加到响应中
//             const receivedData = await dataPromise;
//             // 删除已处理的回调函数
//             delete userCallbacks[requestId];
//             // 将接收到的数据添加到响应中，并发送响应给客户端
//             res.json({userId: req.session.userId , data: receivedData, username: req.user.email, isAdmin: false});
//           };

          
//         } else {
//           console.log('Client socket not found for socket ID:', clientSocketId);
//         }

//     } catch (error) {
//       console.error('Error querying customer_store table:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   }
//   else if (req.isAuthenticated() && req.user.email === 'admin@lotus.com.au'){
//     const store_connection = mysql.createConnection({
//       host: 'localhost',
//       user: 'root',
//       password: '',
//       database: 'online_report',
//     });
  
//     store_connection.connect((error) => {
//       if (error) {
//         console.error('Error connecting to the database:', error);
//         res.status(500).send('There was an error connecting to the database');
//         return;
//       }
  
//       const query = 'SELECT * FROM stores';
//       store_connection.query(query, (error, results) => {
//         if (error) {
//           console.error('There was an error executing the query:', error);
//           res.status(500).send('There was an error executing the query');
//           return;
//         } 
//         console.log('Results:', results);
  
//         res.json({userId: req.session.userId , data: results, isAdmin: true, username: req.user.email});
//       });
  
//       store_connection.end();
//     });
//   }
  
    
//   else {
//     res.status(401).json({ message: 'Not authenticated' });
//   }
// });

app.post('/receiveData', async (req, res) => {

  // console.log('Received encrypted data:', req.body.Report);

    // 获取 Report 数组
  const reportArray = req.body.Report;
  const appId = req.headers.appid;
  const timeStamp = req.headers.timestamp;
  const nonce = req.headers.nonce;
  const shopId = req.headers.shopid;
  const receivedSign = req.headers.sign;


  const checkStores = await executeDb('SELECT * FROM stores WHERE AppId = ? and StoreId= ?', [appId,shopId], { fetchAll: true });
  if(checkStores.length === 0) {
    return res.status(400).send('appId and storeId do not match');
  }
  else {
  // 创建一个要排序的列表
  const sList = [appId, timeStamp, nonce, '/receiveData', shopId];
  sList.sort();

  // 连接排序后的列表
  const s = sList.join('&');

  // 生成 MD5
  const hash = crypto.createHash('md5').update(s).digest('hex');
  //upper case hash
  const hashUpperCase = hash.toUpperCase();

  // 验证签名
  if (hashUpperCase === receivedSign) {
    try {
      
      const paramsObject = reportArray.find(element => element.hasOwnProperty('Params'));
      console.log(paramsObject);
      const date = paramsObject.Params.ReportDate;
      const uploadDatetime = paramsObject.Params.UploadDateTime;
      const edition = paramsObject.Params.Edition;
      const shopId = paramsObject.Params.ShopId; 
      
      const reportObject = reportArray.find(element => element.hasOwnProperty('ReportData'));
      const reportData = reportObject.ReportData;
      
      const columns = Object.keys(reportData).map(column => `\`${column}\``).join(', ');
      
      const options = { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' };
      const currentDate = new Date().toLocaleDateString('en-CA', options);
      // 转换 currentDate 到 Date 对象
      const currentDateObj = new Date(currentDate);
      const [day, month, year] = date.split('/');
      const dateObj = new Date(`${year}-${month}-${day}`);
      const dateMysql = dateObj.toISOString().slice(0, 10);

      if (currentDateObj.getTime() === dateObj.getTime()){
        const lastupdateQuery = `UPDATE stores SET LastestReportUpdateTime = ? WHERE StoreId = ?`;
        await executeDb(lastupdateQuery, [uploadDatetime, shopId], { commit: true });
      }

      //payment records
      const paymentObject = reportArray.find(element => element.hasOwnProperty('Payment'));
      const paymentArray = paymentObject.Payment;
      const deletePaymentQuery = 'DELETE FROM report_payment_records WHERE Date = ? AND StoreId = ?';
      await executeDb(deletePaymentQuery, [dateMysql, shopId], { commit: true });
      const insertPaymentQuery = `INSERT INTO report_payment_records (Description, StoreId, Date,Amount) VALUES (?, ?, ?, ?)`;
      // 遍历paymentArray并插入新记录
      for (let i = 0; i < paymentArray.length; i++) {
        const currentPayment = paymentArray[i];
        for (const [description, amount] of Object.entries(currentPayment)) {
          await executeDb(insertPaymentQuery, [description, shopId, dateMysql, amount], { commit: true });
        }
      }
      //item sales records
      const itemSalesObject = reportArray.find(element => element.hasOwnProperty('ItemSales'));
      const itemSalesArray = itemSalesObject.ItemSales;
      const deleteItemSalesQuery = 'DELETE FROM report_itemsales_records WHERE Date = ? AND StoreId = ?';
      await executeDb(deleteItemSalesQuery, [dateMysql, shopId], { commit: true });
      const insertItemSalesQuery = `INSERT INTO report_itemsales_records (Description, StoreId, Date, Amount, Qty) VALUES (?, ?, ?, ?, ?)`;
      // 遍历itemSalesArray并插入新记录
      for (let i = 0; i < itemSalesArray.length; i++) {
        const currentItemSales = itemSalesArray[i];
        const description = currentItemSales.Description || currentItemSales.Category;
        const qty = currentItemSales.Qty;
        const amount = currentItemSales.Amount;

        
        await executeDb(insertItemSalesQuery, [description, shopId, dateMysql, amount, qty], { commit: true });
      }



      if (edition === "Hospitality") {
        const deleteQuery = 'DELETE FROM report_records_h WHERE Date = ? AND StoreId = ?';
        await executeDb(deleteQuery, [dateMysql, shopId], { commit: true });
        const insertQuery = `INSERT INTO report_records_h (${columns}, StoreId, Date) VALUES (${Array(Object.keys(reportData).length + 2).fill('?').join(', ')})`;
        await executeDb(insertQuery, [...Object.values(reportData), shopId, dateMysql], { commit: true });
        
      } else {
        
        const deleteQuery = 'DELETE FROM report_records_r WHERE Date = ? AND StoreId = ?';
        await executeDb(deleteQuery, [dateMysql, shopId], { commit: true });
        const insertQuery = `INSERT INTO report_records_r (${columns}, StoreId, Date) VALUES (${Array(Object.keys(reportData).length + 2).fill('?').join(', ')})`;
        await executeDb(insertQuery, [...Object.values(reportData), shopId, dateMysql], { commit: true });
      }
      res.status(200).send('Data and signature verified');
    } catch (err) {
      console.error("An error occurred:", err);
      res.status(500).send('Internal Server Error');  
    }
  }
   else {
    res.status(401).send('Invalid signature');
  }}
});



// 处理登录请求
app.post('/login', passport.authenticate('local'), async(req, res) => {
  
  const getStoreIdQuery = 'SELECT StoreId FROM customer_store WHERE cus_id = ?';
  const storeIdsResult = await executeDb(getStoreIdQuery, [req.user.cus_id], { fetchAll: true, commit: false });

  if(storeIdsResult.length === 1) {
    
    // 创建 JWT 载荷
    const payload = {
      userId: req.user.cus_id,
      username: req.user.email,
      isAdmin: req.user.email === process.env.ADMIN_EMAIL, // 根据邮箱判断是否为管理员
      //get first store id
      storeIds: storeIdsResult.map(item => item.StoreId),
      selectedStoreId: storeIdsResult[0].StoreId
    };
        // 生成 JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // 将 JWT 发送给客户端
    res.status(200).json({ token: token });
  }
  else {
    const payload = {
      userId: req.user.cus_id,
      username: req.user.email,
      isAdmin: req.user.email === process.env.ADMIN_EMAIL, // 根据邮箱判断是否为管理员
      storeIds: storeIdsResult.map(item => item.StoreId)
    }
      // 生成 JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // 将 JWT 发送给客户端
    res.status(200).json({ token: token });
  }



});

app.get('/logout', (req, res) => {
  
  // 清除会话数据
  req.session.destroy();
  
  // 清除客户端Cookie中的会话ID
  res.clearCookie('connect.sid');
  
  // 响应登出成功的消息
  res.json({ message: 'Logout successful' });
});


app.post("/register", async (req, res) => {
  try {
    const { activationKey, email, password } = req.body;

    const activationQuery = 'SELECT * FROM activation_keys WHERE key_data = ?';
    const activationResults = await executeDb(activationQuery, [activationKey], { fetchAll: true });

    if (activationResults.length === 0) {
      return res.status(400).json({ message: 'Invalid activation key' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = 'INSERT INTO customers (email, password) VALUES (?, ?)';
    await executeDb(insertQuery, [email, hashedPassword]);

    const activationDeleteQuery = 'DELETE FROM activation_keys WHERE key_data = ?';
    await executeDb(activationDeleteQuery, [activationKey]);

    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while registering the user' });
  }
});
app.get('/store/:storeId', async (req, res) => {
  const storeId = req.params.storeId;

  try {
    // 查询 stores 表
    const storeQuery = 'SELECT * FROM Stores WHERE StoreId = ?';
    const storeResults = await executeDb(storeQuery, [storeId], { fetchAll: true });

    if (storeResults.length > 0) {
      const storeData = storeResults[0];

      // 查询 customers 表和 customer_store 表
      const userQuery = 'SELECT c.cus_id, c.email FROM Customers c INNER JOIN Customer_store cs ON c.cus_id = cs.cus_id WHERE cs.StoreId = ?';
      const userResults = await executeDb(userQuery, [storeId], { fetchAll: true });

      const userData = userResults.length > 0 ? userResults.map((result) => ({
        cus_id: result.cus_id,
        email: result.email,
      })) : [];

      // 返回 storeData 和 userData
      res.json({ storeData, userData });
    } else {
      res.status(404).json({ error: 'Store not found' });
    }
  } catch (error) {
    console.error('Error querying stores or customers and customer_store tables:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/store/:storeId', async (req, res) => {
  // 获取路由参数中的 storeId
  const storeId = req.params.storeId;
  // 从请求体中获取更新的字段
  const receivedDate = req.body.rExpiredDate;
  const rExpiredDate = moment(receivedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');

  const currentDate = new Date().getTime();
  const expiredDate = new Date(rExpiredDate).getTime();

  // 根据日期选择不同的查询
  let query = '';
  if (expiredDate < currentDate) {
    query = 'UPDATE Stores SET r_expired_date = ?, report_function  = 0 WHERE StoreId = ?';
  } else {
    query = 'UPDATE Stores SET r_expired_date = ?, report_function  = 1 WHERE StoreId = ?';
  }

  try {
    await executeDb(query, [rExpiredDate, storeId]);
    res.status(200).json({ message: 'Store updated successfully' });
  } catch (error) {
    console.error('Error querying stores table:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.post('/createNotification', async (req, res) => {
  const { title, content, publishTime, secretKey } = req.body;

  // 验证秘钥
  if (secretKey !== process.env.NOTIFICATION_SECRET_KEY) {
    return res.status(403).json({ success: false, message: 'Invalid secret key' });
  }
  // 验证数据
  if (!title || !content || !publishTime) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // 插入新通知
  const insertQuery = 'INSERT INTO Notifications (title, content, publishdate) VALUES (?, ?, ?)';
  try {
    await executeDb(insertQuery, [title, content, publishTime]);
    return res.status(201).json({ success: true, message: 'Notification created successfully!' });
  } catch (error) {
    console.error('Error querying the database:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while creating the notification' });
  }
});

app.get('/getNotifications', async (req, res) => {
  try {
    const query = 'SELECT * FROM Notifications'; // Notifications表应包括NotiId，title，content，publishdate等字段
    const results = await executeDb(query, null, { fetchAll: true });

    res.json({ success: true, notifications: results });
  } catch (error) {
    console.error('Error querying the database:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching the notifications' });
  }
});

// // const server = http.createServer(app);
// const io = socketIO(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST'],
//   },
// });

async function update_socket_sql(store_id, socket_id) {
  try {
    const selectQuery = 'SELECT StoreId FROM Stores WHERE StoreId = ?';
    const results = await executeDb(selectQuery, [store_id], { fetchAll: true });

    if (results.length > 0) {
      const updateQuery = 'UPDATE Stores SET client_socket_id = ?, connection = 1 WHERE StoreId = ?';
      await executeDb(updateQuery, [socket_id, store_id]);
      console.log(`Updated record with ID ${store_id}`);
    } else {
      const insertQuery = 'INSERT INTO Stores (StoreId, client_socket_id, connection) VALUES (?, ?, 1)';
      await executeDb(insertQuery, [store_id, socket_id]);
      console.log(`Inserted record with ID ${store_id}`);
    }

    console.log('All queries executed successfully');
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

async function find_client_socket(store_id) {
  console.log('Finding client socket for store ID', store_id);
  try {
    const selectQuery = 'SELECT client_socket_id FROM Stores WHERE StoreId = ?';
    const results = await executeDb(selectQuery, [store_id], { fetchAll: true });

    if (results.length > 0) {
      return results[0].client_socket_id;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error executing SELECT query:', error);
    throw error;
  }
}


function listenserver(server) {
  const webpage = new Map();

  io.on('connection', function (socket) {
    // Store webpage socket ID and connection details
    socket.on('message', function (data) {
      console.log(data);
    });
    winston.info('SocketIO > Connected socket ' + socket.id);

    socket.on('login', function (data) {
      // data = store_id
      update_socket_sql(data, socket.id);
    });

    socket.on('sendData', function (data) {
      
      const callback = userCallbacks[data.requestId];
      
      if (callback) {
        // 触发关联的回调函数，并传递数据
        callback(data.data);
      } else {
        console.log('No callback function for requestId:', requestId);
      }
    });
    socket.on('disconnect', function () {
      const connection = mysql.createConnection(connectionConfig);
      connection.connect((error) => {
        if (error) {
          console.error('Error connecting to the database:', error);
        }
      });
      const updateQuery = `UPDATE stores SET connection = 0 WHERE client_socket_id = ?`;
      connection.query(updateQuery, [socket.id], (error, results) => {
        if (error) {
          console.error('Error executing UPDATE query:', error);
        } 
      });
      connection.end();
    });
  });
}

// 创建 HTTPS 服务
const httpsServer = https.createServer(credentials, app);
// 启动 HTTPS 服务器
httpsServer.listen(5050, () => {
  console.log('HTTPS Server running on port 5050');
});

// listenserver(server);

// // 启动服务器
// server.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });
