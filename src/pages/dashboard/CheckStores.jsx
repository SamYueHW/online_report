import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar/Sidebarnew';
import useGetState from '../../hooks/useGetState';
import moment from 'moment-timezone';
import axios from 'axios';
import Chart from '../../components/chart/Chart';
import { useNavigate } from 'react-router-dom';
import './dashboardnew.scss';


const CheckStores = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser, getUser] = useGetState(null);



  const [stores, setStores] = useState(null);
  const navigate = useNavigate();
  const australiaDate = moment.tz('Australia/Sydney').format('YYYY-MM-DD');
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
      
      const params = {
        fselected: selectedDate,
        tselected: tselectedDate, // 你可以根据需要修改这个值
      }

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
    pieChartData = getBranchPaymentData().results.map((payment) => ({
      name: payment.Description,
      value: parseFloat(payment.TotalAmount.toFixed(2)),
    }));
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
            const params = {
              fselected: selectedDate,
              tselected: tselectedDate, // 你可以根据需要修改这个值
              
            }
            
            const response = await axios.post(process.env.REACT_APP_SERVER_URL+'/checkStores', params, config); // 发送请求到服务器
          
            if (response.status === 200 && response.data.success) {
              {
                navigate('/dashboard');
              }
            } 
            else if (response.status === 201 && response.data.success) {

                if (response.data.storeData) {
                    
                    setStores(response.data.storeData); // 如果有多个商店，设置商店名称
                    setBranchPaymentData(response.data.branchPaymentResults);
                    console.log(response.data.branchPaymentResults);
                    
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
  const formatKey = (key) => {
    if (key === 'NegativeSalesAmount') {
      return 'Void Sales Amount';
    }
    return key.replace(/([A-Z])/g, ' $1').trim();
  };

  useEffect(() => {
    if (searchDate !== selectedDate || searchTDate !== tselectedDate) {
      setStores(null);
      setBranchPaymentData(null);
    }
  }, [selectedDate, tselectedDate]);

  return (
    <div className="container">
      {/* <Sidebar user={getUser()} onLogout={handleLogout} isOpen={isSidebarOpen} /> */}
    <div className='main-layout'>
    <div className='content'>
    <main className='main-content v2'>
    <div className='left-column'>

      <h1 className='zdy-t1'>Check Stores</h1>
      <div className="date">
        <h2>Selected Date</h2>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        to
        <input type="date" value={tselectedDate} onChange={(e) => setTSelectedDate(e.target.value)} />
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
                                ? (stores[storeName][key] === 0 ? '$0' : '$' + parseFloat(stores[storeName][key]).toFixed(2)) 
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
      {getBranchPaymentData() && Object.keys(getBranchPaymentData()).length > 0 && (
           <div className='payment-summary'>
          
            <h2>Branch Sales Summary</h2>
            {getBranchPaymentData().results.length > 0 ? (
              <>
                <div className="store-names">
                  <h4>
                    {`Includes: [${Array.isArray(storeNames) ? storeNames.map(store => store.StoreName).join(', ') : ''}]`}
                  </h4>
                </div>
                <div className='non-cash-section'>
                  <div className="icon">
                    <span className='material-icons-sharp'>store</span>
                  </div>
                  <div className="non-cash-container">
                    {getBranchPaymentData().results.map((payment, index) => (
                      <div key={index} className="non-cash-row">
                        <div className="non-cash-description">
                          <h3 style={{marginRight:'10px'}}>{payment.Description}</h3>
                        </div>
                        <div className="non-cash-amount">
                          ${payment.TotalAmount.toFixed(2)}
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
