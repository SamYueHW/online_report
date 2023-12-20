import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar/Sidebarnew';
import useGetState from '../../hooks/useGetState';
import moment from 'moment-timezone';
import axios from 'axios';
import Chart from '../../components/chart/Chart';
import DateRangePickerComponent from '../../components/datepicker/DateRangepicker';
import { useNavigate } from 'react-router-dom';
import './dashboardnew.scss';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';


const CheckStores = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser, getUser] = useGetState(null);



  const [stores, setStores] = useState(null);
  const [totalNetSales, setTotalNetSales] = useState(0);
  const [TotalSalesExTax, setTotalSalesExTax] = useState(0);
  const [GSTItemSales, setGSTItemSales] = useState(0);
  const [totalGSTCollected, setTotalGSTCollected] = useState(0);
  const [totalGSTFreeItemSales, setTotalGSTFreeItemSales] = useState(0);
  const navigate = useNavigate();


// 使用插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 设置时区并获取日期
const australiaDate = dayjs.tz(dayjs(), 'Australia/Sydney').format('DD/MM/YYYY');

  // const australiaDate = moment.tz('Australia/Sydney').format('YYYY-MM-DD');
  const [selectedDate, setSelectedDate] = useState(australiaDate);
  const [tselectedDate, setTSelectedDate] = useState(australiaDate);

  const [searchDate, setSearchDate] = useState(australiaDate);
  const [searchTDate, setSearchTDate] = useState(australiaDate);


  const [storeNames, setStoreNames] = useState(null);
  const [branchPaymentData, setBranchPaymentData,getBranchPaymentData] = useGetState(null);

  const handleLogout = async () => {
    try {
      await axios.get(process.env.REACT_APP_SERVER_URL + '/logout', { withCredentials: true });
      sessionStorage.removeItem('jwtToken');
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };
  function formatCurrency(value) {
    // 使用正则表达式确保数值每三位有一个逗号作为千分位分隔符
    if (!isNaN(value)) {
      return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
  }

  const handleStoreSelect = async (storeId) => {
    try {
      const token = sessionStorage.getItem('jwtToken');
      const config = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };

      const response = await axios.post(process.env.REACT_APP_SERVER_URL + '/selectStore', {storeId}, config);

       if (response.status === 200 && response.data.success) {
          if (response.data.newJwt) {
            sessionStorage.setItem('jwtToken', response.data.newJwt);
          }
          const newtoken = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
          const newconfig = {
            headers: {
              'authorization': `Bearer ${newtoken}`
            }
          };
          
          const response2 = await axios.post(process.env.REACT_APP_SERVER_URL+'/checkStores', {}, newconfig); // 发送请求到服务器
        
          if (response2.status === 200 && response2.data.success) {
            {
              navigate('/dashboard');
            }
          } 
          else{
            handleLogout();
          }

        } 
    } catch (error) {
      navigate('/');
      console.error('Error selecting the store', error);
    }
  };

  
  const handleSearch = async () => {
    // 验证输入
    if (selectedDate === "" || tselectedDate === "") {
      alert("Please make sure [Selected Date] and [TSelected Date] have been filled in!");
      return;
    }
    
    if (new Date(selectedDate) > new Date(tselectedDate)) {
      alert("Please enter a valid date range for Selected Dates.");
      return;
    }
    try {

      const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
      const config = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      
      const fselected = dayjs(selectedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
      const tselected = dayjs(tselectedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');

      const params = {
        fselected: fselected,
        tselected: tselected,
      };

      const response = await axios.post(process.env.REACT_APP_SERVER_URL+'/checkStores', params, config); // 发送请求到服务器
    
      if (response.status === 200 && response.data.success) {
        {
          navigate('/dashboard');
        }
      } 
      else if (response.status === 201 && response.data.success) {
          setSearchDate(selectedDate);
          setSearchTDate(tselectedDate);
          if (response.data.storeData) {
            
            setStores(response.data.storeData); // 如果有多个商店，设置商店名称

            setBranchPaymentData(response.data.branchPaymentResults);

            setStoreNames(response.data.branchPaymentResults.storeNames);
          }
      }
      
      else if (response.status === 401 || response.status === 500) {
        handleLogout(); // 如果状态码是 401（未授权）或 500（服务器内部错误），执行注销操作
      }
    
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 500)) {
        handleLogout(); // 如果状态码是 401（未授权）或 500（服务器内部错误），执行注销操作
      }
      console.error('There was an error fetching the stores', error);
    }
    
  };

  let pieChartData = [];

  if (getBranchPaymentData() && getBranchPaymentData().results.length > 0) {
    pieChartData = getMergedPaymentData().map((payment) => ({
      name: payment.Description,
      value: parseFloat(payment.TotalAmount.toFixed(2)),
    }));
  }
  
  function getMergedPaymentData() {
    const originalData = getBranchPaymentData().results;
    return originalData.reduce((acc, payment) => {
      const existingIndex = acc.findIndex(
        (p) => p.Description === payment.Description
      );
      
      if (existingIndex !== -1) {
        acc[existingIndex].TotalAmount += payment.TotalAmount;
      } else if (payment.Description === 'VISA' || payment.Description === 'VISA CARD') {
        const visaIndex = acc.findIndex(
          (p) => p.Description === 'VISA' || p.Description === 'VISA CARD'
        );
        if (visaIndex !== -1) {
          acc[visaIndex].TotalAmount += payment.TotalAmount;
        } else {
          acc.push({ ...payment });
        }
      } else if (payment.Description === 'DEBIT CARD' || payment.Description === 'DEBIT') {
        const debitIndex = acc.findIndex(
          (p) => p.Description === 'DEBIT CARD' || p.Description === 'DEBIT'
        );
        if (debitIndex !== -1) {
          acc[debitIndex].TotalAmount += payment.TotalAmount;
        } else {
          acc.push({ ...payment });
        }
      }
      else if (payment.Description === 'AMERICAN EXPRESS' || payment.Description === 'AMEX') {
        const amexIndex = acc.findIndex(
          (p) => p.Description === 'AMERICAN EXPRESS' || p.Description === 'AMEX'
        );
        if (amexIndex !== -1) {
          acc[amexIndex].TotalAmount += payment.TotalAmount;
        } else {
          acc.push({ ...payment });
        }
      } 
      
      
      else {
        acc.push({ ...payment });
      }
      return acc;
    }, []).sort((a, b) => {
      if (a.Description === 'CASH') return -1;
      if (b.Description === 'CASH') return 1;
      return 0;
    });
  }
  
  
  useEffect(() => {
    const fetchStores = async () => {
        try {

            const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
            const config = {
              headers: {
                'authorization': `Bearer ${token}`
              }
            };
           
            const fselected = dayjs(selectedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
      const tselected = dayjs(tselectedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');

      const params = {
        fselected: fselected,
        tselected: tselected,
      };
            const response = await axios.post(process.env.REACT_APP_SERVER_URL+'/checkStores', params, config); // 发送请求到服务器
          
            if (response.status === 200 && response.data.success) {
              {
                navigate('/dashboard');
              }
            } 
            else if (response.status === 201 && response.data.success) {

                if (response.data.storeData) {
                    
                    setStores(response.data.storeData); // 如果有多个商店，设置商店名称
                    console.log(response.data.storeData)
                    setBranchPaymentData(response.data.branchPaymentResults);
                    
                    
                    setStoreNames(response.data.branchPaymentResults.storeNames);
                  }
            }
            
            else if (response.status === 401 || response.status === 500) {
              handleLogout(); // 如果状态码是 401（未授权）或 500（服务器内部错误），执行注销操作
            }
          
          } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 500)) {
              handleLogout(); // 如果状态码是 401（未授权）或 500（服务器内部错误），执行注销操作
            }
            console.error('There was an error fetching the stores', error);
          }
          
    };

    fetchStores();
  }, []);

  useEffect(() => {
    let sum = 0;
    let sumGST = 0;
    let sumGSTFreeItemSales = 0;
    let sumGSTItemSales = 0;
    let sumTotalSalesExTax = 0;
    if (stores) {
      Object.keys(stores).forEach((storeName) => {
        const store = stores[storeName];
        // 假设 TotalNetSales 或 TotalSales 存在于每个分店数据中
        if (store.TotalNetSales) {
          sum += store.TotalNetSales;
        } else if (store.NetSales) {
          sum += store.NetSales;
        }

        if (store.GSTItemSales) {
          sumGSTItemSales += store.GSTItemSales;
        } 

         // 计算 TotalGSTCollected
         if (store.GSTCollected) {
          sumGST += store.GSTCollected;
        } else if (store.TotalGST) {
          sumGST += store.TotalGST;
        }

        if (store.TotalSalesExTax) {
          sumTotalSalesExTax += store.TotalSalesExTax;
        }
        if (store.GSTFreeItemSales) {
          sumGSTFreeItemSales += store.GSTFreeItemSales;
        }
      

      });
      setTotalNetSales(sum);
      setTotalGSTCollected(sumGST);

      setTotalSalesExTax(sumTotalSalesExTax);

      setGSTItemSales(sumGSTItemSales);
      setTotalGSTFreeItemSales(sumGSTFreeItemSales);

    }
  }, [stores]);


  const formatKey = (key) => {
    if (key === 'NegativeSalesAmount') {
      return 'Void Sales Amount';
    }
    if (key.includes('GST')) {
      return key.replace('GST', ' GST').replace(/([A-Z][a-z])/g, ' $1').trim();
    }
  

    return key.replace(/([A-Z])/g, ' $1').trim();
  };

  useEffect(() => {
    if (searchDate !== selectedDate || searchTDate !== tselectedDate) {
      setStores(null);
      setBranchPaymentData(null);
    }
  }, [selectedDate, tselectedDate]);

  const handleDateChange = (dates, dateStrings) => {
    // dateStrings 是日期范围的字符串数组，形如 ["YYYY-MM-DD", "YYYY-MM-DD"]
    // 更新您的状态或执行其他逻辑
    if (dateStrings[0] === '' || dateStrings[1] === '') {
      setSelectedDate(australiaDate);
      setTSelectedDate(australiaDate);
    }else{
    setSelectedDate(dateStrings[0]);
    setTSelectedDate(dateStrings[1]);}
  };

  return (
    <div className="container">
      {/* <Sidebar user={getUser()} onLogout={handleLogout} isOpen={isSidebarOpen} /> */}
    <div className='main-layout'>
    <div className='content'>
    <main className='main-content v2'>
    <div className='left-column'>

      <h1 className='zdy-t1'>Check Stores</h1>
      <div className="date">
        

      <DateRangePickerComponent
        value={[selectedDate, tselectedDate]}
        onChange={handleDateChange}
        />
        {/* <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        to
        <input type="date" value={tselectedDate} onChange={(e) => setTSelectedDate(e.target.value)} /> */}
      </div>
      <button className="ripple" onClick={handleSearch}>Search</button>

      <div className='store-list'>
        {stores && Object.keys(stores).map((storeName, index) => (
          <div className='individual-store' key={index}>
            <span className='material-icons-sharp'>store</span>
            <div className="text-muted" style={{tabSize: '15px', paddingTop: '5px'}}>{storeName}</div>
            <div className='middle'>
              <div className='left'>
                {Object.keys(stores[storeName]).map((key, i) => {
                  if (key !== 'storeId') {
                    return (
                      <div key={i} className='row' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',whiteSpace:'nowrap' }}>
                        <h3 style={{ textAlign: 'left', marginRight: '20px'}}>{formatKey(key)}</h3>

                        <h5>
                          {key === 'TotalTransaction' 
                            ? (stores[storeName][key] !== null 
                                ? (stores[storeName][key] === 0 ? '0' : stores[storeName][key]) 
                                : '0') 
                            : (stores[storeName][key] !== null 
                                ? (stores[storeName][key] === 0 ? '$0' : '$' + formatCurrency(parseFloat(stores[storeName][key]))) 
                                : '$0')
                          }
                        </h5>

                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              <div className='select-store-btn'>
                <button className="store-button" onClick={() => handleStoreSelect(stores[storeName].storeId)}>Select</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    




    </div>
    <div className='right-column'>
    <div className='right'>

      <div className='payment-summary'>
      <h2>All Branches Summary</h2>
        <div className='non-cash-section'>
          <div className="icon">
            <span className='material-icons-sharp'>sell</span>  {/* 可以选择你喜欢的图标 */}
          </div>
          <div className="non-cash-container">
          <div className="non-cash-row">
            <div className="non-cash-description">
              <h3>Total Net Sales</h3>
            </div>
            <div className="non-cash-amount">
              ${formatCurrency(totalNetSales)}
            </div>

            </div>

            <div className="non-cash-row">
              <div className="non-cash-description">
                <h3>Total GST Collected</h3>
              </div>
              <div className="non-cash-amount">
                ${formatCurrency(totalGSTCollected)}
              </div>
            </div>

            {TotalSalesExTax !== 0 && (
              <>
              <div className="non-cash-row">
                <div className="non-cash-description">
                  <h3>Total Sales Ex Tax</h3>
                </div>
                <div className="non-cash-amount">
                  ${formatCurrency(TotalSalesExTax)}
                </div>
              </div>
              </>
            )}
            {totalGSTFreeItemSales !== 0 && (
              <>
              <div className="non-cash-row">
                <div className="non-cash-description">
                  <h3>Total GST Free Item Sales</h3>
                </div>
                <div className="non-cash-amount">
                  ${formatCurrency(totalGSTFreeItemSales)}
                </div>
              </div>
              </>
            )}
            {GSTItemSales !== 0 && (
              <>
              <div className="non-cash-row">
                <div className="non-cash-description">
                  <h3>Total GST Item Sales</h3>
                </div>
                <div className="non-cash-amount">
                  ${formatCurrency(GSTItemSales)}
                </div>
              </div>
              </>
            )}

          </div>
        </div>
      </div>


      {getBranchPaymentData() && Object.keys(getBranchPaymentData()).length > 0 && (
           <div className='payment-summary'>
            
            <h2>Branches Payment Summary</h2>
            {getBranchPaymentData().results.length > 0 ? (
              <>
                {/* <div className="store-names">
                  <h4>
                    {`Includes: [${Array.isArray(storeNames) ? storeNames.map(store => store.StoreName).join(', ') : ''}]`}
                  </h4>
                </div> */}
                <div className='non-cash-section'>
                  <div className="icon">
                    <span className='material-icons-sharp'>store</span>
                  </div>
                  <div className="non-cash-container">
                    {getMergedPaymentData().map((payment, index) => (
                      <div key={index} className="non-cash-row">
                        <div className="non-cash-description">
                          <h3 style={{marginRight:'10px'}}>{payment.Description}</h3>
                        </div>
                        <div className="non-cash-amount">
                          ${formatCurrency(payment.TotalAmount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {getBranchPaymentData().results && getBranchPaymentData().results.length > 0 && (
                <Chart title="Payment Method Analytics" data={pieChartData} />
              )}
              </>
            ) : (
              <div></div>
            )}
          </div>
        )}
      </div>
      </div>
      </main>
      </div>
      </div>
    </div>
  );
  
};

export default CheckStores;
