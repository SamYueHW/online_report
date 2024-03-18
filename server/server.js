// const cluster = require('cluster');
// const { da, ca, de } = require('date-fns/locale');
// const os = require('os');

// const cron = require('node-cron');

// // 全局变量，用于追踪/dashboard路由的访问次数
// let trackDashboardAccess = 0;

// if (cluster.isMaster) {
//   // 主进程逻辑
//   const numCPUs = os.cpus().length;

//   console.log(`主进程 ${process.pid} 正在运行`);
//   // 根据 CPU 核心数创建工作进程
//   for (let i = 0; i < numCPUs-1; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker) => {
//     console.log(`工作进程 ${worker.process.pid} 已退出`);
//     // 如果需要，可以在这里重启工作进程
//     cluster.fork();
//   });

// } else {

const express = require('express');
const http = require('http');
const winston = require('winston');

// const mysql = require('mysql');
const mysql = require('mysql2/promise');
const util = require('util');

const jwt = require('jsonwebtoken');

const jwtVerify = util.promisify(jwt.verify);


const bcrypt = require("bcrypt") // Importing bcrypt package
const crypto = require('crypto');

const passport = require("passport")
const LocalStrategy = require('passport-local').Strategy;

const session = require("express-session");
const { v4: uuidv4 } = require('uuid');

const { connect } = require('http2');
const fernet = require('fernet');
const { darkScrollbar } = require('@mui/material');

const { Console, group } = require('console');
const moment = require('moment');
const momentlocal = require('moment-timezone');



const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });


//https
const fs = require('fs');
const https = require('https');

// 读取证书文件
const privateKey  = fs.readFileSync("C:/Coding/qr/qr_order/server/enrichpos_com_au/apache/enrichpos_com_au.key", 'utf8');
const certificate = fs.readFileSync("C:/Coding/qr/qr_order/server/enrichpos_com_au/apache/enrichpos_com_au.pem", 'utf8');
const ca = fs.readFileSync('C:/Coding/qr/qr_order/server/enrichpos_com_au/apache//ca.pem', 'utf8');

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


const cors = require('cors');


app.use(cors({
  origin: ['https://enrichpos.com.au:3002','https://enrichpos.com.au'], // 明确指定允许的来源
  // origin: 'http://localhost:3002', // 明确指定允许的来源
  
  
  credentials: true, 
}));
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'https://enrichpos.com.au:3002')
//   res.header('Access-Control-Allow-Credentials', 'true')
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
//   next();
// });

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



// 创建连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 3, // 连接池大小，根据需要调整
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

const pool2 = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_ONLINE_ORDER_DATABASE,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});
async function executeOnlineOrderDb(query, values = null, options = { fetchAll: false, fetchOne: false, commit: false }) {
  const connection = await pool2.getConnection(); // 从连接池中获取连接
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
    if (queryTrimmedUpper.startsWith('INSERT')) {
      // 如果是 INSERT 操作，返回包含 insertId 的对象
      return { ...results, insertId: results.insertId };
    }
    else if (options.fetchAll) {
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

  const fselected = req.body.fselected;
  const tselected = req.body.tselected;

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
        const storeIdsquery = 'SELECT StoreId, StoreName FROM stores WHERE StoreId IN (?)';
        const results = await executeDb(storeIdsquery, [storeIds], { fetchAll: true });

        // 初始化一个空对象来存储每个storeId的汇总数据
        const storeData = {};

        // 遍历每个storeId并执行SQL查询
        const promises = results.map(async (result) => {
          let query;
          const storeId = result.StoreId;

          const pos_version_query = 'SELECT PosVersion, StoreName FROM stores WHERE StoreId = ?';
          const pos_version_results = await executeDb(pos_version_query, [storeId], { fetchAll: true });

          // const columnsToSum_h = ['NetSales', 'Total ']

          const columnsToSum = ['TotalNetSales', 
          'TotalTransaction', 
          'TotalEftpos', 
          'NegativeSalesAmount','GSTItemSales','GSTFreeItemSales','GSTCollected'];  

          const columnsToSum_h = ['NetSales',
          'TotalTransaction',
          'TotalEftposPayment', 
          'VoidAmount',
          'TotalGST',
          'TotalSalesExTax',

          ];
          const sumColumns = columnsToSum.map(column => `SUM(${column}) AS ${column}`).join(', ');
          const sumColumns_h = columnsToSum_h.map(column => `SUM(${column}) AS ${column}`).join(', ');

          if (pos_version_results[0].PosVersion == '1') {
            query = `
              SELECT 
                  ${sumColumns_h},
                  SUM(TotalSales) / SUM(TotalTransaction) AS AverageSales,
                  SUM(TotalDiscount + VoucherDiscount) AS TotalDiscount
              FROM report_records_h 
              WHERE StoreId = ? AND Date BETWEEN ? AND ?
            `;
          } else {
            query = `
              SELECT
                  ${sumColumns},
                  SUM(TotalNetSales) / SUM(TotalTransaction) AS AverageSales,
                  SUM(RedeemPoints + ItemDiscount + DollarDiscount + VoucherDiscount) AS TotalDiscount
              FROM report_records_r
              WHERE StoreId = ? AND Date BETWEEN ? AND ?
            `;
          }

          // 执行SQL查询并存储结果
          const queryResults = await executeDb(query, [storeId, fselected, tselected], { fetchAll: true });
          storeData[pos_version_results[0].StoreName] = queryResults[0];  // 假设queryResults[0]包含了该storeId的汇总数据
          storeData[pos_version_results[0].StoreName]['storeId'] = storeId;  // 添加storeId到商店数据中
        });

        
        // 等待所有查询完成
        await Promise.all(promises);
        let branchPaymentWithDate = {};

        if (storeIds.length > 1) {
          const storeNamesQuery = 'SELECT StoreName FROM stores WHERE StoreId IN (?)';
          const storeNamesResults = await executeDb(storeNamesQuery, [storeIds], { fetchAll: true });

          const placeholders = storeIds.map(() => '?').join(', ');
          const branchPayment = `SELECT Description, SUM(Amount) as TotalAmount FROM report_payment_records WHERE Date BETWEEN ? AND ? AND StoreId IN (${placeholders}) GROUP BY Description`;

          const branchPaymentResults = await executeDb(branchPayment, [fselected, tselected, ...storeIds], { fetchAll: true });
          branchPaymentWithDate = {
            storeNames: storeNamesResults,
            results: branchPaymentResults
          };

          
        }
        // console.log(branchPaymentWithDate);
        // 将汇总数据发送回客户端
        res.status(201).json({ success: true, storeData: storeData, branchPaymentResults: branchPaymentWithDate });

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

app.post('/selectStore', (req, res) => {
  const origin_token = req.headers['authorization'];  // 打印所有请求头，以便调试
  const token = origin_token.split(' ')[1]; // 获取 JWT Token
  // 验证并解码 JWT
  jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const storeIds = decoded.storeIds; // 从载荷中获取 storeIds
    const selectedStoreId = decoded.selectedStoreId; // 从载荷中获取 selectedStoreId
  
    // 创建新的 JWT 载荷（payload）
    const newPayload = { ...decoded, selectedStoreId: req.body.storeId };
    // 生成新的 JWT
    const newToken = jwt.sign(newPayload, process.env.JWT_SECRET_KEY);
    res.status(200).json({ success: true, newJwt:newToken });
  });
});

app.get('/checkAccount', (req, res) => {
  try{
    const origin_token = req.headers['authorization'];  // 打印所有请求头，以便调试
    const token = origin_token.split(' ')[1]; // 获取 JWT Token
    // 验证并解码 JWT
    jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
    if(decoded.isAdmin === true){
      return res.status(200).json({ success: true, isAdmin: true });
  }})
  
  }catch (error) {
    console.error('Error querying customer_store table:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/dashboard',(req, res) => {
    try {
      
      const origin_token = req.headers['authorization'];  // 打印所有请求头，以便调试
      // 检查 origin_token 是否存在
  if (!origin_token) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }
      const token = origin_token.split(' ')[1]; // 获取 JWT Token
      // 验证并解码 JWT
      jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
        if (err) {
          return res.status(401).json({ success: false, message: 'Invalid token' });
        }

      
      if(decoded.isAdmin === true){
        if (decoded.username === process.env.ADMIN_EMAIL_LOTUS) {
          query = 'SELECT * FROM stores WHERE Category = "melb" ORDER BY storeId DESC';
          customer_query = 'SELECT * FROM customers WHERE Category = "melb"';
        }
        else if (decoded.username === process.env.ADMIN_EMAIL_IPOS) {
          query = 'SELECT * FROM stores WHERE Category = "syd" ORDER BY storeId DESC';
          customer_query = 'SELECT * FROM customers WHERE Category = "syd"';
        }
        else if (decoded.username === process.env.ADMIN_EMAIL_QLD) {
          query = 'SELECT * FROM stores WHERE Category = "qld" ORDER BY storeId DESC';
          customer_query = 'SELECT * FROM customers WHERE Category = "qld"';
        }
        else if (decoded.username === process.env.ADMIN_EMAIL_ENRICH) {
          query = 'SELECT * FROM stores ORDER BY storeId DESC';
          customer_query = 'SELECT * FROM customers';
        }

        
        
        const store_result = await executeDb(query, [], { fetchAll: true });

        const storeIds = store_result.map(store => store.StoreId);
        const c_s_query = `
          SELECT cs.*, c.email 
          FROM customer_store AS cs 
          JOIN customers AS c ON cs.cus_id = c.cus_id 
          WHERE cs.StoreId IN (${storeIds.join(', ')})
        `; // 假设字段名为 StoreId 和 cus_id
        const c_s_results = await executeDb(c_s_query, [], { fetchAll: true });
        
        const customer_results = await executeDb(customer_query, [], { fetchAll: true });



        // const query = 'SELECT * FROM stores';
        // const customer_query = 'SELECT * FROM customers';
        // const c_s_query = 'SELECT * FROM customer_store';
        // const customer_results = await executeDb(customer_query, [], { fetchAll: true });
        // const c_s_results = await executeDb(c_s_query, [], { fetchAll: true });
        // const store_result = await executeDb(query, { fetchAll: true });
        // const key_query = 'SELECT * FROM activation_keys';
        // const key_result = await executeDb(key_query, [], { fetchAll: true });
        return res.status(200).json({ success: true, isAdmin: true, store_data: store_result, username: decoded.username, customer_store_data: c_s_results, customer_data: customer_results });
      }
      else{
        return res.status(200).json({ success: false, isAdmin: false });
      }
    });
    } catch (error) {
      console.error('Error querying customer_store table:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

const fetchData = async (selectedDate, tselectedDate, posVersionQuery, jwtToken) => {
  try {
    const decoded = await jwtVerify(jwtToken, process.env.JWT_SECRET_KEY);
    const storeIds = decoded.storeIds;
    const selectedStoreId = decoded.selectedStoreId;

    if (selectedStoreId && storeIds.includes(selectedStoreId)) {
      let hasBranch = false;
      if (storeIds.length > 1) {
        hasBranch = true;
      }
      const pos_version_results = await executeDb(posVersionQuery, [selectedStoreId], { fetchAll: true });
      const LastestReportUpdateTimeResult = pos_version_results[0].LastestReportUpdateTime;
      
      const customer_name_query = 'SELECT CustomerName FROM customers WHERE email = ?';
      const customer_name_results = await executeDb(customer_name_query, [decoded.username], { fetchAll: true });
      const ClientNameResult = customer_name_results[0].CustomerName;
      let query;
      const columnsToSum = [
        'TotalSales', 
        'Surcharge', 
        'SalesRefund', 
        'RedeemPoints', 
        'ItemDiscount', 
        'DollarDiscount', 
        'VoucherDiscount', 
        'TotalNetSales', 
        'CreditNotesPayment', 
        'CreditNotesIssued', 
        'GiftcardSales', 
        'GiftcardPayment', 
        'Deposit', 
        'TotalReceived',
        'CashFloatIn',
        'CashFloatOut',
        'CashInTill',
        'TotalEftpos',
        'TotalTransaction',
        'NegativeSalesQty',
        'NegativeSalesAmount',
        'GSTItemSales',
        'GSTFreeItemSales',
        'GSTCollected',
        'TotalVoucherReceived',
        'NonSalesTillOpen'
    ];

    const columnsToSum_h = [
      'TotalSales',
      'TotalDiscount',
      'VoucherDiscount',
      'PointsRedeem',
      'NetSales',
      'Rounding',
      'TotalTips',
      'CreditCardSurcharge',
      'GiftcardSales',
      'GiftcardPayment',
      'TotalReceived',
      'CashPayOut',
      'CashFloatIn',
      'CashFloatOut',
      'CashInDrawer',
      'CashLessTips',
      'TotalEftposPayment',
      'TotalVoucherReceived',
      'TotalSalesExTax',
      'TotalGST',
      'TotalServiceCharge',
      'TotalOtherCharge',
      'TotalPeople',
      'TotalTransaction',
      'WastageAmount',
      'VoidQty',
      'VoidAmount',
      'NonSaleOpenDrawer',
    ];

    const sumColumns_r = columnsToSum.map(column => `SUM(${column}) AS ${column}`).join(', ');
    const sumColumns_h = columnsToSum_h.map(column => `SUM(${column}) AS ${column}`).join(', ');
    const lastWeekDate = moment(selectedDate).subtract(7, 'days').format('YYYY-MM-DD');
    let lastWeekNetSalesQuery;
  

 
    if (pos_version_results[0].PosVersion === 1) {
        query = `
            SELECT 
                ${sumColumns_h},
                SUM(TotalSales) / SUM(TotalTransaction) AS AverageSales,
                SUM(NetSales) / SUM(TotalPeople) AS PPH
                
            FROM report_records_h 
            WHERE StoreId = ? AND Date BETWEEN ? AND ?
        `;
        lastWeekNetSalesQuery = `SELECT NetSales FROM report_records_h WHERE StoreId = ? AND Date = ?`;

    } else {
        query = `
            SELECT 
                ${sumColumns_r},
                SUM(TotalNetSales) / SUM(TotalTransaction) AS AverageSales
            FROM report_records_r 
            WHERE StoreId = ? AND Date BETWEEN ? AND ?
        `;
        lastWeekNetSalesQuery = `SELECT TotalNetSales FROM report_records_r WHERE StoreId = ? AND Date = ?`;
    }
      
      const results = await executeDb(query, [selectedStoreId, selectedDate, tselectedDate], { fetchAll: true });
      const dataWithDate = {};

      //YYYY-MM-DD to DD-MM-YYYY
      const selectedDateArray = selectedDate.split('-');
      const tselectedDateArray = tselectedDate.split('-');
      const selectedDatenew = `${selectedDateArray[2]}/${selectedDateArray[1]}/${selectedDateArray[0]}`;
      const tselectedDatenew = `${tselectedDateArray[2]}/${tselectedDateArray[1]}/${tselectedDateArray[0]}`;

      const dateRangeKey = `${selectedDatenew} - ${tselectedDatenew}`;
  

      if (results.length === 0) {
        dataWithDate[dateRangeKey] = {};
      } else {
        dataWithDate[dateRangeKey] = results;
      }
      const lastWeekNetSales = await executeDb(lastWeekNetSalesQuery, [selectedStoreId, lastWeekDate], { fetchAll: true });
      const lastWeekNetSalesResult = lastWeekNetSales[0]?.TotalNetSales ?? lastWeekNetSales[0]?.NetSales;

      const itemSalesQuery = 'SELECT Description, sum(Amount) as Amount, sum(Qty) as Qty FROM report_itemsales_records WHERE StoreId = ? AND Date BETWEEN ? AND ? GROUP BY Description ORDER By Amount DESC';
      const itemSalesResults = await executeDb(itemSalesQuery, [selectedStoreId, selectedDate, tselectedDate], { fetchAll: true });
      const paymentQuery = 'SELECT Description, sum(Amount) as Amount FROM report_payment_records WHERE StoreId = ? AND Date BETWEEN ? AND ? GROUP BY Description';
      const paymentResults = await executeDb(paymentQuery, [selectedStoreId, selectedDate, tselectedDate], { fetchAll: true });
      let groupItemSalesResults = [];
      if (pos_version_results[0].PosVersion === 1) {
        const groupItemSalesQuery = 'SELECT ItemGroup, sum(Amount) as Amount, sum(Qty) as Qty FROM item_group_records_h WHERE StoreId IN (?) AND Date BETWEEN ? AND ? GROUP BY ItemGroup ORDER By Amount DESC';
        groupItemSalesResults = await executeDb(groupItemSalesQuery, [selectedStoreId, selectedDate, tselectedDate], { fetchAll: true });
      
      }
      const groupItemSalesWithDate= {};
        
        if (groupItemSalesResults.length === 0) {
          groupItemSalesWithDate[dateRangeKey] = {};
        } else {
          groupItemSalesWithDate[dateRangeKey] = groupItemSalesResults;
        }
      

      const itemSalesWithDate= {};
      if (itemSalesResults.length === 0) {
        itemSalesWithDate[dateRangeKey] = {};
      } else {
        itemSalesWithDate[dateRangeKey] = itemSalesResults;
      }

      


      const paymentSalesWithDate= {};
      if (paymentResults.length === 0) {
        paymentSalesWithDate[dateRangeKey] = {};
      } else {
        paymentSalesWithDate[dateRangeKey] = paymentResults;
      }
      const storeNamesQuery = 'SELECT StoreName FROM stores WHERE StoreId = ?';
      const storeNamesResults = await executeDb(storeNamesQuery, [selectedStoreId], { fetchAll: true });
      
      return { status: 200, data: {
      PosVersion: pos_version_results[0].PosVersion,
      ClientNameResult: ClientNameResult,
      StoreName: pos_version_results[0].StoreName,
      LastestReportUpdateTimeResult: LastestReportUpdateTimeResult,
      results: dataWithDate, 
      StoreName: storeNamesResults[0],
      itemSalesResults:itemSalesWithDate,
      paymentResults:paymentSalesWithDate, 
      hasBranchResult: hasBranch,
      groupItemSalesResults: groupItemSalesWithDate,
      lastWeekNetSalesResult: lastWeekNetSalesResult,

      // branchPaymentResults:branchPaymentWithDate, 
      isAdmin: false } };
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
  const tselected = req.query.tselected;
  const origin_token = req.headers['authorization'];
  // 检查 origin_token 是否存在
  if (!origin_token) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }

  const token = origin_token.split(' ')[1];
  const pos_version_query = 'SELECT PosVersion, LastestReportUpdateTime,StoreName FROM stores WHERE StoreId = (?)';

  if (fselected !== "") {
    const result = await fetchData(fselected, tselected, pos_version_query, token);
    res.status(result.status).json(result.data);
  }
});




// 定义一个异步函数
const fetchRangeData = async (selectedDate, tselectedDate, posVersionQuery, jwtToken) => {
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
      //YYYY-MM-DD to DD-MM-YYYY
      const selectedDateArray = selectedDate.split('-');
      const tselectedDateArray = tselectedDate.split('-');
      const selectedDatenew = `${selectedDateArray[2]}/${selectedDateArray[1]}/${selectedDateArray[0]}`;
      const tselectedDatenew = `${tselectedDateArray[2]}/${tselectedDateArray[1]}/${tselectedDateArray[0]}`;

      const dateRangeKey = `${selectedDatenew} - ${tselectedDatenew}`;

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


// 定义一个异步函数
const fetchSalesSummary = async (selectedDate, tselectedDate, posVersionQuery, jwtToken, dateType) => {
  try {
    const decoded = await jwtVerify(jwtToken, process.env.JWT_SECRET_KEY);

    const storeIds = decoded.storeIds;
    const selectedStoreId = decoded.selectedStoreId;


    if (selectedStoreId && storeIds.includes(selectedStoreId)) {
      let hasBranch = false;
      if (storeIds.length > 1) {
        hasBranch = true;
      }

      const pos_version_results = await executeDb(posVersionQuery, [selectedStoreId], { fetchAll: true });
      let query;
      if (pos_version_results[0].PosVersion === 1) {
        // 构建 SQL 查询
        query = `SELECT NetSales as TotalNetSales, Date FROM report_records_h WHERE StoreId = ? AND Date >= ? AND Date <= ?`;
      } else {
        query = `SELECT TotalNetSales, Date FROM report_records_r WHERE StoreId = ? AND Date >= ? AND Date <= ?`;
      }
   
      const results = await executeDb(query, [selectedStoreId, selectedDate,tselectedDate], { fetchAll: true });
      const dataWithDate = {};
      const dateRangeKey = `${selectedDate} - ${tselectedDate}`;

      const hourlyResult = {};
      // if (dateType === 'day') {
        const hourlyQuery = `SELECT SalesHour, Transaction, Amount, Date FROM report_hourlysales_records WHERE StoreId = ? AND Date >= ? AND Date <= ? ORDER BY SalesHour ASC`;
        const hourlyResults = await executeDb(hourlyQuery, [selectedStoreId, selectedDate, tselectedDate], { fetchAll: true });
        if (hourlyResults.length === 0) {
          hourlyResult[dateRangeKey] = {};
        } else {
          hourlyResult[dateRangeKey] = hourlyResults;
        }
      // }
      // const hourlyQuery = `SELECT SalesHour, Transaction, Amount, Date FROM report_hourlysales_records WHERE StoreId = ? AND Date >= ? AND Date <= ? ORDER BY SalesHour ASC`;
      // const hourlyResults = await executeDb(hourlyQuery, [selectedStoreId, selectedDate, tselectedDate], { fetchAll: true });
          
      // if (hourlyResults.length === 0) {
      //   hourlyResult[dateRangeKey] = {};
      // } else {
      //   hourlyResult[dateRangeKey] = hourlyResults;
      // }
      
      const customer_name_query = 'SELECT CustomerName FROM customers WHERE email = ?';
      const customer_name_results = await executeDb(customer_name_query, [decoded.username], { fetchAll: true });
      const ClientNameResult = customer_name_results[0].CustomerName;
      
  

      if (results.length === 0) {
        dataWithDate[dateRangeKey] = {};
      } else {
        dataWithDate[dateRangeKey] = results;
      }
    

      return { status: 200, data: { message: 'success', results: dataWithDate, hasBranchResult: hasBranch, isAdmin: false, posVersion: pos_version_results[0], hourlyResult: hourlyResult, StoreName:pos_version_results[0].StoreName, LastestReportUpdateTimeResult: pos_version_results[0].LastestReportUpdateTime, ClientNameResult:ClientNameResult } };
    } else {
      return { status: 400, data: { message: 'Invalid store id' } };
    }
  } catch (error) {
    console.error('Error querying customer_store table:', error);
    return { status: 500, data: { message: 'Internal server error' } };
  }
};

// 在你的路由处理器中使用这个函数
app.get('/searchSalesSummary', async (req, res) => {
  let fselected = req.query.fselected;
  const fcompared = req.query.fcompared;
  let tselected = req.query.tselected;
  const tcompared = req.query.tcompared;
  const dateType = req.query.dateType;


 
  const origin_token = req.headers['authorization'];
  // 检查 origin_token 是否存在
  if (!origin_token) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }

  const token = origin_token.split(' ')[1];
  const pos_version_query = 'SELECT * FROM stores WHERE StoreId = ?';

  if(fselected !== "" && tselected !== "" && fcompared === "" && tcompared === "" ) {
    const result = await fetchSalesSummary(fselected, tselected, pos_version_query, token, dateType);

    if (dateType !== 'day') {
    res.status(200).json({
      message: 'success',
      results: [result.data.results],
      hasBranchResult: result.data.hasBranchResult,
      isAdmin: false,
      posVersion: result.data.posVersion,
      hourlyResult: [result.data.hourlyResult],
      StoreName: result.data.StoreName,
      LastestReportUpdateTimeResult: result.data.LastestReportUpdateTimeResult,
      ClientNameResult: result.data.ClientNameResult,
      DateType: dateType
    });}
    else {
      res.status(200).json({
        message: 'success',
        results: [result.data.results],
        hasBranchResult: result.data.hasBranchResult,
        isAdmin: false,
        posVersion: fselectedResult.data.posVersion,
        hourlyResult: [result.data.hourlyResult],
        StoreName: result.data.StoreName,
        LastestReportUpdateTimeResult: result.data.LastestReportUpdateTimeResult,
        ClientNameResult: result.data.ClientNameResult,
        DateType: dateType
      });
    }
  } else if (fselected !== "" && fcompared !== "" && tselected !== "" && tcompared !== "") {
    const fselectedResult = await fetchSalesSummary(fselected,tselected, pos_version_query, token, dateType);
    const fcomparedResult = await fetchSalesSummary(fcompared, tcompared, pos_version_query, token, dateType);
    
    if (fselectedResult.status===200 && fcomparedResult.status===200) {
      if (dateType !== 'day') {

      res.status(200).json({
        message: 'success',
        results: [fselectedResult.data.results,
          fcomparedResult.data.results],
          hourlyResult: [fselectedResult.data.hourlyResult,fcomparedResult.data.hourlyResult],
        hasBranchResult: fselectedResult.data.hasBranchResult,
        isAdmin: false,
        posVersion: fselectedResult.data.posVersion,
        StoreName: fselectedResult.data.StoreName,
        LastestReportUpdateTimeResult: fselectedResult.data.LastestReportUpdateTimeResult,
        ClientNameResult: fselectedResult.data.ClientNameResult,
        DateType: dateType
      });}
      else {
        
        res.status(200).json({
          message: 'success',
          results: [fselectedResult.data.results,
            fcomparedResult.data.results],
          hourlyResult: [fselectedResult.data.hourlyResult, fcomparedResult.data.hourlyResult],
          hasBranchResult: fselectedResult.data.hasBranchResult,
          isAdmin: false,
          posVersion: fselectedResult.data.posVersion,
          hourlyResult: [fselectedResult.data.hourlyResult,
            fcomparedResult.data.hourlyResult],
            StoreName: fselectedResult.data.StoreName,
        LastestReportUpdateTimeResult: fselectedResult.data.LastestReportUpdateTimeResult
        ,
        ClientNameResult: fselectedResult.data.ClientNameResult,
        DateType: dateType
        });
      }
    } else {
      res.status(400).json({ message: 'Invalid store id' });
    }
  }
});

const fetchWeeklyData = async (selectedDate, posVersionQuery, jwtToken) => {
  try {
    const decoded = await jwtVerify(jwtToken, process.env.JWT_SECRET_KEY);

    const storeIds = decoded.storeIds;
    const selectedStoreId = decoded.selectedStoreId;
    const pos_version_results = await executeDb(posVersionQuery, [selectedStoreId], { fetchAll: true });

    if (selectedStoreId && storeIds.includes(selectedStoreId) && pos_version_results[0].PosVersion === 0) {
      let hasBranch = false;
      if (storeIds.length > 1) {
        hasBranch = true;
      }

      
      
      const query = 'SELECT * FROM report_itemsales_records WHERE StoreId = ? AND Date BETWEEN ? AND ?';
      
      const tselectedDate = moment(selectedDate).add(6, 'days').format('YYYY-MM-DD');
    
      const results = await executeDb(query, [selectedStoreId, selectedDate, tselectedDate], { fetchAll: true });
      const dataWithDate = {};
      const dateRangeKey = `${selectedDate} - ${tselectedDate}`;
      const totalNetSalesQuery = 'select TotalSales, Date from report_records_r where StoreId = ? and Date BETWEEN ? AND ?';
      const totalNetSalesResults = await executeDb(totalNetSalesQuery, [selectedStoreId, selectedDate, tselectedDate], { fetchAll: true });
      const totalNetSalesWithDate = {};
      if (totalNetSalesResults.length === 0) {
        totalNetSalesWithDate[dateRangeKey] = {};
      }
      else {
        totalNetSalesWithDate[dateRangeKey] = totalNetSalesResults;
      }

      const customer_name_query = 'SELECT CustomerName FROM customers WHERE email = ?';
      const customer_name_results = await executeDb(customer_name_query, [decoded.username], { fetchAll: true });
      const ClientNameResult = customer_name_results[0].CustomerName;
      
      


      if (results.length === 0) {
        dataWithDate[dateRangeKey] = {};
      } else {
        dataWithDate[dateRangeKey] = results;
      }
    

      return { status: 200, data: { message: 'success', results: dataWithDate, hasBranchResult: hasBranch, isAdmin: false, posVersion: pos_version_results[0], StoreName:pos_version_results[0].StoreName, LastestReportUpdateTimeResult: pos_version_results[0].LastestReportUpdateTime, ClientNameResult:ClientNameResult, totalNetSalesWithDate:totalNetSalesWithDate  

        }
      } 
    }
    else {
      return { status: 400, data: { message: 'Invalid store id' } };
    }
  } catch (error) {
    console.error('Error querying customer_store table:', error);
    return { status: 500, data: { message: 'Internal server error' } };
  }
};


app.get('/weeklysales', async (req, res) => {
  
  const fselected = req.query.selectedDate;

  const origin_token = req.headers['authorization'];

  // 检查 origin_token 是否存在
  if (!origin_token) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }


  const token = origin_token.split(' ')[1];
  const pos_version_query = 'SELECT * FROM stores WHERE StoreId = ?';

  const result = await fetchWeeklyData(fselected, pos_version_query, token);
  if (result.status === 200) {
    res.status(result.status).json({
      
      results: [result.data.results],
      hasBranchResult: result.data.hasBranchResult,
      isAdmin: false,
      posVersion: result.data.posVersion,
      StoreName: result.data.StoreName,
      LastestReportUpdateTimeResult: result.data.LastestReportUpdateTimeResult,
      ClientNameResult: result.data.ClientNameResult,
      TotalNetSalesWithDate: result.data.totalNetSalesWithDate
    });
  }
  else {
    res.status(result.status).json(result.data);
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
//       if (del) {
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
  try {
    const reportArray = req.body.Report;
    const appId = req.headers.appid;
    const timeStamp = req.headers.timestamp;
    const nonce = req.headers.nonce;
    const shopId = req.headers.shopid;
    const receivedSign = req.headers.sign;

    const checkStoreExpire = await executeDb('SELECT ReportLicenseExpire FROM stores WHERE StoreId= ?', [shopId], { fetchAll: true });
    const expireDate = checkStoreExpire[0].ReportLicenseExpire;

    let expireDateObj = new Date(expireDate);
    const currentDate = new Date();
    expireDateObj.setDate(expireDateObj.getDate() + 7);
    if (currentDate.getTime() >= expireDateObj.getTime()) {
      return res.status(410).send('License expired');
    }

    const checkStores = await executeDb('SELECT * FROM stores WHERE AppId = ? and StoreId= ?', [appId, shopId], { fetchAll: true });
    if (checkStores.length === 0) {
      return res.status(410).send('appId and storeId do not match');
    }

    const sList = [appId, timeStamp, nonce, '/receiveData', shopId];
    sList.sort();
    const s = sList.join('&');
    const hash = crypto.createHash('md5').update(s).digest('hex');
    const hashUpperCase = hash.toUpperCase();
    
    console.log(req.body);

    if (hashUpperCase === receivedSign) {
      try {

        const paramsObject = reportArray.find(element => element.hasOwnProperty('Params'));
        
        const date = paramsObject.Params.ReportDate;

        const uploadDatetime = paramsObject.Params.UploadDateTime;
        const edition = paramsObject.Params.Edition;
        if (paramsObject.Params.Version) {
          const apiVersion = paramsObject.Params.Version
          const updateApiVersionQuery = 'UPDATE stores SET ApiVersion = ? WHERE StoreId = ?';
          await executeDb(updateApiVersionQuery, [apiVersion, shopId], { commit: true });
        }

        const reportObject = reportArray.find(element => element.hasOwnProperty('ReportData'));
        const reportData = reportObject.ReportData;
        const columns = Object.keys(reportData).map(column => `\`${column}\``).join(', ');

        const options = { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' };
        const currentDate = new Date().toLocaleDateString('en-CA', options);
        const currentDateObj = new Date(currentDate);
        const [day, month, year] = date.split('/');
        const dateObj = new Date(`${year}-${month}-${day}`);
        const dateMysql = dateObj.toISOString().slice(0, 10);

        if (currentDateObj.getTime() === dateObj.getTime()) {
          const lastupdateQuery = `UPDATE stores SET LastestReportUpdateTime = ? WHERE StoreId = ?`;
          await executeDb(lastupdateQuery, [uploadDatetime, shopId], { commit: true });
        }

        const paymentObject = reportArray.find(element => element.hasOwnProperty('Payment'));
        const paymentArray = paymentObject.Payment;
        const deletePaymentQuery = 'DELETE FROM report_payment_records WHERE Date = ? AND StoreId = ?';
        await executeDb(deletePaymentQuery, [dateMysql, shopId], { commit: true });
        const insertPaymentQuery = `INSERT INTO report_payment_records (Description, StoreId, Date, Amount) VALUES (?, ?, ?, ?)`;
        for (let i = 0; i < paymentArray.length; i++) {
          const currentPayment = paymentArray[i];
          for (const [description, amount] of Object.entries(currentPayment)) {
            await executeDb(insertPaymentQuery, [description, shopId, dateMysql, amount], { commit: true });
          }
        }
        if (reportArray.find(element => element.hasOwnProperty('HourlySales'))) {
          const hourlySalesObject = reportArray.find(element => element.hasOwnProperty('HourlySales'));
          const hourlySalesArray = hourlySalesObject.HourlySales;
          hourlySalesArray.forEach(async item => {
            const { SalesHour, Transaction, Amount } = item;
            try {
            const delete_query = 'DELETE FROM report_hourlysales_records WHERE Date = ? AND StoreId = ? AND SalesHour = ?';
            await executeDb(delete_query, [dateMysql, shopId, SalesHour], { commit: true });
            const query = 'INSERT INTO report_hourlysales_records (StoreId, Date, SalesHour, Transaction, Amount) VALUES (?, ?, ?, ?, ?)';
            await executeDb(query, [shopId, dateMysql, SalesHour, Transaction, Amount], { commit: true });
            } catch (error) {
              console.error("An error occurred:", error);
            }
          });   
        }
        
        if (reportArray.find(element => element.hasOwnProperty('ItemGroupSales'))){
          const itemGroupSalesObject = reportArray.find(element => element.hasOwnProperty('ItemGroupSales'));
          const itemGroupSalesArray = itemGroupSalesObject.ItemGroupSales;
          itemGroupSalesArray.forEach(async item => {
            const { ItemGroup, Amount, Qty } = item;
            try {
              const delete_query = 'DELETE FROM item_group_records_h WHERE Date = ? AND StoreId = ?';
              await executeDb(delete_query, [dateMysql, shopId], { commit: true });
              const query = 'INSERT INTO item_group_records_h (StoreId, Date, ItemGroup, Amount, Qty) VALUES (?, ?, ?, ?, ?)';
              await executeDb(query, [shopId, dateMysql, ItemGroup, Amount, Qty], { commit: true });
            } catch (error) {
              console.error("An error occurred:", error);
            }
          });
        }

        const itemSalesObject = reportArray.find(element => element.hasOwnProperty('ItemSales'));
        const itemSalesArray = itemSalesObject.ItemSales;
        const deleteItemSalesQuery = 'DELETE FROM report_itemsales_records WHERE Date = ? AND StoreId = ?';
        await executeDb(deleteItemSalesQuery, [dateMysql, shopId], { commit: true });
        const insertItemSalesQuery = `INSERT INTO report_itemsales_records (Description, StoreId, Date, Amount, Qty, Cost) VALUES (?, ?, ?, ?, ?, ?)`;
        for (let i = 0; i < itemSalesArray.length; i++) {
          const currentItemSales = itemSalesArray[i];
          
          const description = currentItemSales.Description || currentItemSales.Category;
          const qty = currentItemSales.Qty;
          const amount = currentItemSales.Amount;
          const cost = currentItemSales.Cost || 0;
          await executeDb(insertItemSalesQuery, [description, shopId, dateMysql, amount, qty, cost], { commit: true });
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
        console.error("An error occurred in inner block:", err);
        res.status(500).send('Internal Server Error');  
      }
    } else {
      res.status(401).send('Invalid signature');
    }

  } catch (err) {
    console.error("An error occurred in outer block:", err);
    res.status(500).send('Internal Server Error');
  }
});



app.delete('/user/:userId/:storeId', (req, res) => {

  const userId = req.params.userId;
  const storeId = req.params.storeId;
  const deleteQuery = 'DELETE FROM customer_store WHERE cus_id = ? AND StoreId = ?';
  try {
    executeDb(deleteQuery, [userId, storeId], { commit: true });
    res.status(200).json({ message: 'success' });
  }
  catch (error) {
    console.error('Error querying customer_store table:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/deleteOnlineReport/:storeId', async (req, res) => {
  
  try {
  const origin_token = req.headers['authorization'];

  // 检查 origin_token 是否存在
  if (!origin_token) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }

  // 现在我们知道 origin_token 是存在的，可以安全地调用 split
  const token = origin_token.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (decoded.isAdmin) {

      const storeId = req.params.storeId;
      let deleteReportQuery;
      let deleteGroupQuery
      const  pos_version_query = 'SELECT PosVersion FROM stores WHERE StoreId = ?';
      const pos_version_results = await executeDb(pos_version_query, [storeId], { fetchAll: true });
      if (pos_version_results[0].PosVersion === 1) {
        deleteReportQuery = 'DELETE FROM report_records_h WHERE StoreId = ?';
        deleteGroupQuery = 'DELETE FROM item_group_records_h WHERE StoreId = ?'
      }
      else {
        deleteReportQuery = 'DELETE FROM report_records_r WHERE StoreId = ?';
      }
      
      
      let deleteQuery;
      checkFunctionQuery = 'SELECT ReportFunction, OnlineOrderFunction FROM stores WHERE StoreId = ?';
      await executeDb(checkFunctionQuery, [storeId], { fetchOne: true });
      const checkFunctionResults = await executeDb(checkFunctionQuery, [storeId], { fetchOne: true });
      if (checkFunctionResults.OnlineOrderFunction === 1) {
        deleteQuery = 'UPDATE stores SET AppId = ?, ReportLicenseExpire = ?, ReportFunction = 0 WHERE StoreId = ?';
        await executeDb(deleteQuery, [null, null, storeId], { commit: true });
      }
      else{
        deleteQuery = 'DELETE FROM stores WHERE StoreId = ?';
        await executeDb(deleteQuery, [storeId], { commit: true });
      }
      
      
   
      const deletelinkQuery = 'DELETE FROM customer_store WHERE StoreId = ?';
      const deletePaymentQuery = 'DELETE FROM report_payment_records WHERE StoreId = ?';
      const deleteItemSalesQuery = 'DELETE FROM report_itemsales_records WHERE StoreId = ?';
      const deleteHourlySalesQuery = 'DELETE FROM report_hourlysales_records WHERE StoreId = ?';
     
        await executeDb(deletelinkQuery, [storeId], { commit: true });
        await executeDb(deletePaymentQuery, [storeId], { commit: true });
        await executeDb(deleteItemSalesQuery, [storeId], { commit: true });
        await executeDb(deleteReportQuery, [storeId], { commit: true });
        await executeDb(deleteHourlySalesQuery, [storeId], { commit: true });
        if (pos_version_results[0].PosVersion === 1) {
          await executeDb(deleteGroupQuery, [storeId], { commit: true });
        }

        res.status(200).json({ message: 'success' });
      
    }
    else {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
  });
}
catch (error) {
  console.error('Error querying customer_store table:', error);
  res.status(500).json({ message: 'Internal server error' });
}
});

app.delete('/deleteQR/:storeId', async (req, res) => {
  
  try {
  const origin_token = req.headers['authorization'];

  // 检查 origin_token 是否存在
  if (!origin_token) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }

  // 现在我们知道 origin_token 是存在的，可以安全地调用 split
  const token = origin_token.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (decoded.isAdmin) {

      const storeId = req.params.storeId;
      const deleteMenuQuery = 'DELETE FROM store_menuitem WHERE StoreId = ?';
      await executeOnlineOrderDb(deleteMenuQuery, [storeId], { fetchAll: true });
      const deleteOrderQuery = 'DELETE FROM store_order WHERE StoreId = ?';
      await executeOnlineOrderDb(deleteOrderQuery, [storeId], { fetchAll: true });
      const deleteSubmenuLinkQuery = 'DELETE FROM store_sub_menulink_detail WHERE StoreId = ?';
      await executeOnlineOrderDb(deleteSubmenuLinkQuery, [storeId], { fetchAll: true });
      const deleteQRStoreInfoQuery = 'DELETE FROM store_qr_information WHERE StoreId = ?';
      await executeOnlineOrderDb(deleteQRStoreInfoQuery, [storeId], { fetchAll: true });

      //image folder delete
      const menuItemsPath = path.join(__dirname, `../public/images/${storeId}`);
      if (fs.existsSync(menuItemsPath)) {
        fs.rmdirSync(menuItemsPath, { recursive: true });
      }
      
      
      let deleteQuery;
      checkFunctionQuery = 'SELECT ReportFunction, OnlineOrderFunction FROM stores WHERE StoreId = ?';
      await executeDb(checkFunctionQuery, [storeId], { fetchOne: true });
      const checkFunctionResults = await executeDb(checkFunctionQuery, [storeId], { fetchOne: true });
     
      if (checkFunctionResults.ReportFunction === 1) {
        deleteQuery = 'UPDATE stores SET StoreOnlineOrderAppId = ?, QROrderLicenseExpire = ?, OnlineOrderFunction = 0, StripePrivateKey = ?,StripeWebhookKey = ?, StoreUrl= ? WHERE StoreId = ?';
        await executeDb(deleteQuery, [null, null, null, null, null, storeId], { commit: true });
        res.status(200).json({ message: 'success' });
      }
      else{
        deleteQuery = 'DELETE FROM stores WHERE StoreId = ?';
        await executeDb(deleteQuery, [storeId], { commit: true });
        
        res.status(201).json({ message: 'success' });

      }

       
      
    }
    else {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
  });
}
catch (error) {
  console.error('Error querying customer_store table:', error);
  res.status(500).json({ message: 'Internal server error' });
}
});


app.post('/allocateUser', async (req, res) => {
  const { userId, storeId } = req.body;
  const insertQuery = 'INSERT INTO customer_store (cus_id, StoreId) VALUES (?, ?)';
  try {
    await executeDb(insertQuery, [userId, storeId], { commit: true });
    res.status(200).json({ message: 'success' });
  }
  catch (error) {
    console.error('Error querying customer_store table:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/createStore', async (req, res) => {

  const { storeName, posVersion, category, Location} = req.body;
  const insertQuery = 'INSERT INTO stores (StoreName, PosVersion, Category, Location) VALUES (?, ?, ?, ?)';
  try {
    await executeDb(insertQuery, [storeName, posVersion, category, Location], { commit: true });
    res.status(200).json({ message: 'success' });
  }
  catch (error) {
    console.error('Error querying customer_store table:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.post('/activeReport', async (req, res) => {
  const { storeId,appId, expireDate } = req.body;
  const updateQuery = 'UPDATE stores SET AppId = ?, ReportLicenseExpire = ?, ReportFunction = 1 WHERE StoreId = ?';
  try{
    await executeDb(updateQuery, [appId, expireDate, storeId], { commit: true });
    res.status(200).json({ message: 'success' });
  }catch (error) {
    console.error('Error querying store table:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


async function encrypt(text) {
  const secretKey = process.env.STRIPE_KEY_ENCRYPT_SECRET;
  const key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substr(0, 32); // 扩展到32字节

  const cipher = crypto.createCipheriv('aes-256-ecb', key, null);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}


app.post('/activeQROrder',async (req, res) => {
  let { storeId, appId, expireDate, StripePrivateKey, StripeWebhookKey, StoreUrl, StoreLatitude, StoreLongitude, StoreLocationRange } = req.body;
  //encrypt StripePrivateKey
  let encryptedStripePrivateKey = '';
  let encryptedStripeWebhookKey = '';
  let insertQRInformationQuery;
 //StoreId	PayFirst	UseLocation	MultiLanguage	FirstLanguage	SecondLanguage	MondayStart	MondayEnd	TuesdayStart	TuesdayEnd	WednesdayStart	WednesdayEnd	ThursdayStart	ThursdayEnd	FridayStart	FridayEnd	SaturdayStart	SaturdayEnd	SundayStart	SundayEnd	SurchargeDescription	Surcharge	WeekendSurcharge	

  if (StripePrivateKey !== '' && StripeWebhookKey !== '') {
   encryptedStripePrivateKey = await encrypt(StripePrivateKey);
   encryptedStripeWebhookKey = await encrypt(StripeWebhookKey);
   insertQRInformationQuery = `
   INSERT INTO store_qr_information (
     StoreId,
     PayFirst,
     UseLocation,
     MultiLanguage,
     FirstLanguage,
     SecondLanguage,
     MondayStart,
     MondayEnd,
     TuesdayStart,
     TuesdayEnd,
     WednesdayStart,
     WednesdayEnd,
     ThursdayStart,
     ThursdayEnd,
     FridayStart,
     FridayEnd,
     SaturdayStart,
     SaturdayEnd,
     SundayStart,
     SundayEnd,
     SurchargeDescription,
     Surcharge,
     WeekendSurcharge
   )VALUES (?, 1, 0, 0, null, null, '08:00', '23:59', '08:00', '23:59', '08:00', '23:59', '08:00', '23:59', '08:00', '23:59', '08:00', '23:59', '08:00', '23:59', 'Surcharge', 0, 0)`;
   }
  else {
    encryptedStripePrivateKey = null;
    encryptedStripeWebhookKey = null;
    insertQRInformationQuery = `
    INSERT INTO store_qr_information (
      StoreId,
      PayFirst,
      UseLocation,
      MultiLanguage,
      FirstLanguage,
      SecondLanguage,
      MondayStart,
      MondayEnd,
      TuesdayStart,
      TuesdayEnd,
      WednesdayStart,
      WednesdayEnd,
      ThursdayStart,
      ThursdayEnd,
      FridayStart,
      FridayEnd,
      SaturdayStart,
      SaturdayEnd,
      SundayStart,
      SundayEnd,
      SurchargeDescription,
      Surcharge,
      WeekendSurcharge
    ) VALUES (?, 0, 1, 0, null, null, '08:00', '23:59', '08:00', '23:59', '08:00', '23:59', '08:00', '23:59', '08:00', '23:59', '08:00', '23:59', '08:00', '23:59', 'Surcharge', 0, 0)`;
   
  }

  if (StoreLatitude === '' && StoreLongitude === '') {
    StoreLatitude = null;
    StoreLongitude = null;
    
  }
  const updateQuery = 'UPDATE stores SET StoreOnlineOrderAppId = ?, QROrderLicenseExpire = ?, OnlineOrderFunction = 1, StripePrivateKey = ?, StripeWebhookKey = ?, StoreUrl = ?, StoreLatitude = ?, StoreLongitude = ?, StoreLocationRange = ? WHERE StoreId = ?';
 
  try{
    await executeDb(updateQuery, [appId, expireDate, encryptedStripePrivateKey, encryptedStripeWebhookKey, StoreUrl, StoreLatitude, StoreLongitude , StoreLocationRange, storeId ], { commit: true });
    await executeOnlineOrderDb(insertQRInformationQuery, [storeId], { commit: true });
    res.status(200).json({ message: 'success' });
  }catch (error) {
    console.error('Error querying store table:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/generateKey', async (req, res) => {
  const keyData  = req.body.newKey;
  const insertQuery = 'INSERT INTO activation_keys (key_data) VALUES (?)';
  try {
    await executeDb(insertQuery, [keyData], { commit: true });
    res.status(200).json({ message: 'success' });
  }
  catch (error) {
    console.error('Error querying customer_store table:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/getKeys', async (req, res) => {
  const query = 'SELECT * FROM activation_keys';
  try {
    const results = await executeDb(query, [], { fetchAll: true });
    res.status(200).json({ message: 'success', results: results });
  }
  catch (error) {
    console.error('Error querying customer_store table:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/update-jwt', async (req, res) => {
  const origin_token = req.headers['authorization'];

  // 检查 origin_token 是否存在
  if (!origin_token) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }

  // 现在我们知道 origin_token 是存在的，可以安全地调用 split
  const token = origin_token.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // 删除 selectedStoreId
    delete decoded.selectedStoreId;

    // 创建新的 JWT 载荷（payload）
    const newPayload = { ...decoded };
    // 生成新的 JWT
    const newToken = jwt.sign(newPayload, process.env.JWT_SECRET_KEY);
    res.status(200).json({ success: true, newJwt: newToken });
  });
});

app.post('/qrAdminLogin', async(req, res) => {
 
  const origin_token = req.headers['authorization'];
 
    
    // 检查 origin_token 是否存在
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
  
    const token = origin_token.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
      
      if (decoded.isAdmin) {

        const storeId = req.body.storeId;
        
        const payload = { cusId:0, email: "admin", storeId: storeId, storeAdmin: true };
       // 服务器端的示例代码
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
      

        return res.status(200).json({ jwt: token, storeId: storeId });
      }
      else {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
    }
    );
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
      isAdmin: req.user.email === process.env.ADMIN_EMAIL_LOTUS || req.user.email === process.env.ADMIN_EMAIL_IPOS || req.user.email === process.env.ADMIN_EMAIL_QLD || req.user.email === process.env.ADMIN_EMAIL_ENRICH,
      // 根据邮箱判断是否为管理员
      //get first store id
      storeIds: storeIdsResult.map(item => item.StoreId),
      selectedStoreId: storeIdsResult[0].StoreId
    };
        // 生成 JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    if (req.user.email === process.env.ADMIN_EMAIL_LOTUS || req.user.email === process.env.ADMIN_EMAIL_IPOS || req.user.email === process.env.ADMIN_EMAIL_QLD|| req.user.email === process.env.ADMIN_EMAIL_ENRICH) {
      res.status(200).json({ token: token, isAdmin: true });
    }
    else {
    
      const insertLogQuery = 'INSERT INTO user_login_logs (cus_id, login_time) VALUES (?, NOW())';
      await executeDb(insertLogQuery, [req.user.cus_id], { commit: true });

      res.status(200).json({ token: token, isAdmin: false });
    }
    
  }
  else {
    const payload = {
      userId: req.user.cus_id,
      username: req.user.email,
      isAdmin: req.user.email === process.env.ADMIN_EMAIL_LOTUS || req.user.email === process.env.ADMIN_EMAIL_IPOS || req.user.email === process.env.ADMIN_EMAIL_QLD || req.user.email === process.env.ADMIN_EMAIL_ENRICH,
// 根据邮箱判断是否为管理员
      storeIds: storeIdsResult.map(item => item.StoreId)
    }
      // 生成 JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    // 将 JWT 发送给客户端
    if (req.user.email === process.env.ADMIN_EMAIL_LOTUS || req.user.email === process.env.ADMIN_EMAIL_IPOS || req.user.email === process.env.ADMIN_EMAIL_QLD || req.user.email === process.env.ADMIN_EMAIL_ENRICH) {
      res.status(200).json({ token: token, isAdmin: true });
    }
    else {
      const insertLogQuery = 'INSERT INTO user_login_logs (cus_id, login_time) VALUES (?, NOW())';
      await executeDb(insertLogQuery, [req.user.cus_id], { commit: true });
      res.status(200).json({ token: token, isAdmin: false });
    }
  }



});

async function registerUser(username, password, storeId ) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // 使用 bcrypt 对密码进行加密，10 是 salt rounds
    const selectQuery = 'SELECT * FROM customer WHERE StoreId = ?'; 
    const results = await executeOnlineOrderDb(selectQuery, [storeId], { fetchAll: true });
    if (results.length > 0 && results[0].Email === username) {
      const updateQuery = 'UPDATE customer SET Password = ? WHERE Email = ?';
      await executeOnlineOrderDb(updateQuery, [hashedPassword, username]);
      return 1;
    }
    else{

      const insertQuery = 'INSERT INTO customer (Email, Password, StoreId) VALUES (?, ?, ?)';
      await executeOnlineOrderDb(insertQuery, [username, hashedPassword, storeId]); // 存储用户名和加密后的密码
      return 0;
  }
    
  } catch (error) {
   
    return -1;
  }
}
app.post('/getQRCustomer', async (req, res) => {
  try{
    const origin_token = req.headers['authorization'];
    
    // 检查 origin_token 是否存在
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
  
    const token = origin_token.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
      
      if (decoded.isAdmin) {

        const storeId = req.body.storeId;
       
        const query = 'SELECT * FROM customer WHERE StoreId = ?';
        const results = await executeOnlineOrderDb(query, [storeId], { fetchOne: true });
        res.status(200).json({ message: 'success', results: results });
      }
      else {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
    });
  }
  catch (error) {
    console.error('Error querying store table:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/updateQRCustomer', async (req, res) => {
  try {
    const origin_token = req.headers['authorization'];
    
    // 检查 origin_token 是否存在
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
  
    const token = origin_token.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
      
      if (decoded.isAdmin) {
        const { customer, storeId } = req.body;
        

        const registerResult = await registerUser(customer.email, customer.password, storeId);
        if (registerResult===0) {
          res.status(200).send('User registered successfully');
        } 
        else if(registerResult===1)
        {
          res.status(201).send('User updated successfully');
        }
        else{
          res.status(500).send('Error registering new user');
        
        }
      }
      else {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
    });
  } catch (error) {
    res.status(500).send('Error registering new user');
  }
});

app.delete('/deleteQRUser/:userId', async (req, res) => {
  try{
    const origin_token = req.headers['authorization'];
    
    // 检查 origin_token 是否存在
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
  
    const token = origin_token.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
      
      if (decoded.isAdmin) {
        const userId = req.params.userId;
        const deleteQuery = 'DELETE FROM customer WHERE Id = ?';
        await executeOnlineOrderDb(deleteQuery, [userId], { commit: true });
        res.status(200).json({ message: 'success' });
      }
      else {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
    }
    );

  }
  catch (error) {
    console.error('Error querying store table:', error);
    res.status(500).json({ message: 'Internal server error' });
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
    const { activationKey, email, password, name } = req.body;

    const activationQuery = 'SELECT * FROM activation_keys WHERE key_data = ?';
    const activationResults = await executeDb(activationQuery, [activationKey], { fetchAll: true });

    if (activationResults.length === 0) {
      return res.status(400).json({ message: 'Invalid activation key' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = 'INSERT INTO customers (email, password, CustomerName) VALUES (?, ?, ?)';
    await executeDb(insertQuery, [email, hashedPassword, name]);

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

      const allUsersQuery = 'SELECT cus_id, email FROM Customers';
      const allUsersResults = await executeDb(allUsersQuery, [], { fetchAll: true });

      // 返回 storeData 和 userData
      res.json({ storeData:storeData, userData:userData, allUsers: allUsersResults });
    } else {
      res.status(404).json({ error: 'Store not found' });
    }
  } catch (error) {
    console.error('Error querying stores or customers and customer_store tables:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/updateCustomer/:cusId', async (req, res) => {
  try {
  const cusId = req.params.cusId;
  const customer_data = req.body; 
  const origin_token = req.headers['authorization'];
  // 检查 origin_token 是否存在
  if (!origin_token) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }

  const token = origin_token.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (decoded.isAdmin) {
      let updateQuery;
      if (customer_data.Password === '') {
        const hashedPassword = await bcrypt.hash(customer_data.Password, 10);
        updateQuery = 'UPDATE customers SET email = ?, CustomerName = ?, Address = ?, ContactNumber = ?, Category = ?, Password = ? WHERE cus_id = ?';
        await executeDb(updateQuery, [customer_data.email, customer_data.CustomerName, customer_data.Address, customer_data.ContactNumber, customer_data.Category, hashedPassword, cusId], { commit: true });
      }
      else {
        updateQuery = 'UPDATE customers SET email = ?, CustomerName = ?, Address = ?, ContactNumber = ?, Category = ? WHERE cus_id = ?';
        await executeDb(updateQuery, [customer_data.email, customer_data.CustomerName, customer_data.Address, customer_data.ContactNumber, customer_data.Category, cusId], { commit: true });
      }

      
      res.status(200).json({ message: 'success' });
    }
    else {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  });
  }
  catch (error) {
    console.error('Error querying stores or customers and customer_store tables:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/deleteCustomer/:cus_id', async (req, res) => {
  try{
    const cus_id = req.params.cus_id;
    const origin_token = req.headers['authorization'];
    // 检查 origin_token 是否存在
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
     // 现在我们知道 origin_token 是存在的，可以安全地调用 split
    const token = origin_token.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
      if (decoded.isAdmin) {
        const deleteQuery = 'DELETE FROM customers WHERE cus_id = ?';
        const deletelinkQuery = 'DELETE FROM customer_store WHERE cus_id = ?';
        await executeDb(deleteQuery, [cus_id], { commit: true });
        await executeDb(deletelinkQuery, [cus_id], { commit: true });
        res.status(200).json({ message: 'success' });
      }
      else {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
    });
  }
  catch (error) {
    console.error('Error querying stores or customers and customer_store tables:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/fetchTableNumber/:storeId', async (req, res) => {
  try {

    const origin_token = req.headers['authorization'];
    // 检查 origin_token 是否存在
    if (!origin_token) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
     // 现在我们知道 origin_token 是存在的，可以安全地调用 split
    const token = origin_token.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
      if (decoded.isAdmin) {
        const storeId = req.params.storeId;
        
        const query = 'SELECT * FROM store_table_number WHERE StoreId = ?';
        const results = await executeOnlineOrderDb(query, [storeId], { fetchAll: true });
        const storeUrl = await executeDb('SELECT StoreUrl FROM stores WHERE StoreId = ?', [storeId], { fetchOne: true });
        res.status(200).json({ message: 'success', results: results, storeUrl: storeUrl.StoreUrl });
      }
      else {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
    });
  }
  catch (error) {
    console.error('Error querying store_table_number table:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/store/:storeId', async (req, res) => {
  try{
  // 获取路由参数中的 storeId
  const storeId = req.params.storeId;

  // 从请求体中获取更新的字段
  const receivedDate = req.body.rExpiredDate;
  const storeName = String(req.body.storeName);
  

  const rExpiredDate = moment(receivedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');

  const QrExpiredDate = req.body.QrExpiredDate;
  const QrExpiredDateObj = moment(QrExpiredDate).format('YYYY-MM-DD');

  
  const StripePrivateKey = req.body.StripePrivateKey;
  const StripeWebhookKey = req.body.StripeWebhookKey;
  const StoreUrl = req.body.StoreUrl;
  const StoreLatitude = req.body.StoreLatitude;
  const StoreLongitude = req.body.StoreLongitude;
  const StoreLocationRange = req.body.StoreLocationRange;

 

  let query = '';
  
  if ((StripePrivateKey.length < 5 && StripeWebhookKey.length < 5) ) {
    query = 'UPDATE stores SET StoreName = ?, ReportLicenseExpire = ?, QROrderLicenseExpire = ?, StoreUrl = ?, StoreLatitude = ?, StoreLongitude = ?, StoreLocationRange = ? WHERE StoreId = ?';
    await executeDb(query, [storeName, rExpiredDate, QrExpiredDateObj, StoreUrl, StoreLatitude, StoreLongitude, StoreLocationRange, storeId], { commit: true });
  }
  else if (StripePrivateKey.length < 5) {
  
    const encryptedStripeWebhookKey = await encrypt(StripeWebhookKey);
    query = 'UPDATE stores SET StoreName = ?, ReportLicenseExpire = ?, QROrderLicenseExpire = ?, StripeWebhookKey = ?, StoreUrl = ?, StoreLatitude = ?, StoreLongitude = ?, StoreLocationRange = ? WHERE StoreId = ?';
    await executeDb(query, [storeName, rExpiredDate, QrExpiredDateObj, encryptedStripeWebhookKey, StoreUrl, StoreLatitude, StoreLongitude, StoreLocationRange, storeId], { commit: true });
  }
  else if (StripeWebhookKey.length < 5) {
    const encryptedStripePrivateKey = await encrypt(StripePrivateKey);
    query = 'UPDATE stores SET StoreName = ?, ReportLicenseExpire = ?, QROrderLicenseExpire = ?, StripePrivateKey = ?, StoreUrl = ?, StoreLatitude = ?, StoreLongitude = ?, StoreLocationRange = ? WHERE StoreId = ?';
    await executeDb(query, [storeName, rExpiredDate, QrExpiredDateObj, encryptedStripePrivateKey, StoreUrl, StoreLatitude, StoreLongitude, StoreLocationRange, storeId], { commit: true });
  }
  else {
    const encryptedStripePrivateKey = await encrypt(StripePrivateKey);
    const encryptedStripeWebhookKey = await encrypt(StripeWebhookKey);
    query = 'UPDATE stores SET StoreName = ?, ReportLicenseExpire = ?, QROrderLicenseExpire = ?, StripePrivateKey = ?, StripeWebhookKey = ?, StoreUrl = ?, StoreLatitude = ?, StoreLongitude = ?, StoreLocationRange = ? WHERE StoreId = ?';
    await executeDb(query, [storeName, rExpiredDate, QrExpiredDateObj, encryptedStripePrivateKey, encryptedStripeWebhookKey, StoreUrl, StoreLatitude, StoreLongitude, StoreLocationRange, storeId], { commit: true });
  }

  
    
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

app.post('/registerCustomer', async (req, res) => {
  try {
    const { email, password, name, address, contact_number, category} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = 'INSERT INTO customers (email, password, CustomerName, Address, ContactNumber, Category) VALUES (?, ?, ?, ?, ?, ?)';
    await executeDb(insertQuery, [email, hashedPassword, name, address, contact_number, category]);
    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while registering the user' });
  }
}
);



app.post('/updatePassword', async (req, res) => {
  try {
    const origin_token = req.headers['authorization'];

  // 检查 origin_token 是否存在
  if (!origin_token) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }

  // 现在我们知道 origin_token 是存在的，可以安全地调用 split
  const token = origin_token.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    const email = decoded.username;
    const { oldPassword, newPassword } = req.body;
    const selectQuery = 'SELECT password FROM customers WHERE email = ?';
    const results = await executeDb(selectQuery, [email], { fetchAll: true });
    const hashedPassword = results[0].password;
    const isPasswordCorrect = await bcrypt.compare(oldPassword, hashedPassword);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: 'Incorrect password' });
    }
    else{const newHashedPassword = await bcrypt.hash(newPassword, 10);
    const updateQuery = 'UPDATE customers SET password = ? WHERE email = ?';
    await executeDb(updateQuery, [newHashedPassword, email]);

    
    res.status(200).json({ message: 'Password updated successfully' });
    }
  
  });

   
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while updating the password' });
  }
});

app.get('/getLogData', async (req, res) => {
  try {
    
    const query = 'SELECT ull.*, cs.StoreId, s.Category FROM user_login_logs ull JOIN customer_store cs ON ull.cus_id = cs.cus_id JOIN stores s ON cs.StoreId = s.StoreId';

    const loginLogsResults = await executeDb(query, [], { fetchAll: true });
    const storeCountquery = 'SELECT * FROM daily_user_counts';
    const storeCountResults = await executeDb(storeCountquery, [], { fetchAll: true });
    res.status(200).json({ message: 'success', userCounts: loginLogsResults, dailyCounts: storeCountResults });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while fetching the data' });
  }
});


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



  // cron.schedule('17 2 * * *', async () => {
  //   console.log('Running daily tasks...');

  //  const totalStoresQuery = 'SELECT COUNT(*) as totalStores FROM stores';
  //   const totalStoresResults = await executeDb(totalStoresQuery, [], { fetchAll: true });
    
  //   const ausDate = momentlocal().tz('Australia/Sydney').format('YYYY-MM-DD');
  //   // 将数据保存到app_matics数据库
  //   const insertQuery = 'INSERT INTO app_metrics (Date, ReportAccess, TotalStore) VALUES (?, ?, ?)';
  //    executeDb(insertQuery, [ausDate, trackDashboardAccess, totalStoresResults.totalStores], { commit: true });

  //   //重置trackDashboardAccess变量
  //   trackDashboardAccess = 0;
  // });









// if (process.env.NODE_APP_INSTANCE === '0') {
//   cron.schedule('59 23 * * *', async () => {
//     // 定时任务逻辑
//   });
// }
const cron = require('node-cron');
if (process.env.NODE_APP_INSTANCE === '0') {
// cron.schedule('59 23 * * *', async () => {
  cron.schedule('01 00 * * *', async () => {
  

  // 在这里执行数据库查询和更新逻辑
  try {
    const totalStoresQuery = 'SELECT COUNT(*) AS totalStores FROM stores WHERE LastestReportUpdateTime IS NOT NULL AND Category = ?';
    const totalStoresResultsSyd = await executeDb(totalStoresQuery, ['syd'], { fetchAll: true });
    const totalStoresResultsMel = await executeDb(totalStoresQuery, ['mel'], { fetchAll: true });
    const totalStoresResultsBris = await executeDb(totalStoresQuery, ['qld'], { fetchAll: true });

    const totalStoresSyd = totalStoresResultsSyd[0].totalStores;
    const totalStoresMel = totalStoresResultsMel[0].totalStores;
    const totalStoresBris = totalStoresResultsBris[0].totalStores;

    // 更新 current_user_count 表
    if (totalStoresResultsSyd.length === 0) {
        
      const insertQuery = 'INSERT INTO daily_user_counts (Date, UserCount, Category) VALUES (CURDATE(), ?, ?)';
      await executeDb(insertQuery, [totalStoresSyd, 'syd'], { commit: true });
      await executeDb(insertQuery, [totalStoresMel, 'mel'], { commit: true });
      await executeDb(insertQuery, [totalStoresBris, 'qld'], { commit: true });
      console.log('Successfully updated daily_user_counts table');
    }


    await executeDb(insertQuery, [totalStores], { commit: true });

    console.log('Successfully updated daily_user_counts table');
  } catch (error) {
    console.error('Error occurred during cron job:', error);
  }
});
}
//创建 HTTPS 服务

const httpsServer = https.createServer(credentials, app);
// 启动 HTTPS 服务器
httpsServer.listen(5046, () => {
  console.log('HTTPS Server running on port 5046');
});


// // 创建 HTTP 服务
// const httpServer = http.createServer(app);



// // 启动 HTTP 服务器
// httpServer.listen(5046, () => {
//   console.log('HTTP Server running on port 5046');
// });

