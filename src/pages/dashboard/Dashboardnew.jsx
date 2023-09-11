import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import "./dashboardnew.scss";
import Sidebar from '../../components/sidebar/Sidebarnew';
import Adminsidebar from '../../components/sidebar/Adminsidebar';
import { useNavigate } from 'react-router-dom';
import useGetState from '../../hooks/useGetState';
import moment from 'moment-timezone';
import { CircularProgress } from '@mui/material';
import Leaderboard from '../../components/leaderboard/Leaderboard';

const Dashboardnew = () => {
  const [user, setUser, getUser] = useGetState(null);
  const [lastestUpdate, setLastestUpdate] = useState(null);
  const [isUserFetched, setIsUserFetched, getIsUserFetched] = useGetState(false);
  const [isAdmin, setIsAdmin, getIsAdmin] = useGetState(false);

  const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
  const [dashboard_data, setDashboard_data, getDashboard_data] = useGetState(null);
  const [leaderboardData, setleaderboardData] = useState(null);

  const [paymentData, setPaymentData, getPaymentData] = useGetState(null);
  const [cashAmount, setCashAmount] = useState(0);
  const [nonCashPayments, setNonCashPayments] = useState([]);

  const [branchPaymentData, setBranchPaymentData,getBranchPaymentData] = useGetState(null);
  
  const themeTogglerRef = useRef(null);  // 创建一个 ref

  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState('');
  const [selectedConnection, setSelectedConnection] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // 设置澳大利亚悉尼时区的当前日期
  const australiaDate = moment.tz('Australia/Sydney').format('YYYY-MM-DD');

    // 当前日期状态
  const [selectedDate, setSelectedDate] = useState(australiaDate);

  // 判断 selectedDate 是否与当前日期相匹配
  const isCurrentDate = selectedDate === australiaDate;



  const formatDate = (dateString) => {
    return moment(new Date(dateString)).format('YYYY-MM-DD');
  };
  function formatDateTime(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 如果小时为0，则转换为12
  
    return `${day}/${month}/${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }
  
  const handleThemeToggle = () => {
    document.body.classList.toggle('dark-theme-variables');
    const themeToggler = document.querySelector('.theme-toggler');
    if (themeToggler) {
      themeToggler.querySelector('span:nth-child(1)').classList.toggle('active');
      themeToggler.querySelector('span:nth-child(2)').classList.toggle('active');
    }
  };
  
  const processPaymentData = (paymentData, selectedDate) => {
    let cash = 0;
    const nonCash = [];
   
    if (paymentData && paymentData.date === selectedDate) {
      paymentData.results.forEach(item => {
        if (item.Description.toUpperCase() === 'CASH') {
          cash = item.Amount;
        } else {
          nonCash.push(item);
        }
      });
    }
  
    return {
      cashAmount: cash,
      nonCashPayments: nonCash,
    };
  };
  

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearch = async () => {
    // 验证输入
    if (selectedDate === "") {
      alert("Please make sure [Selected Date] has been filled in!");
      return;
    }
    // 构造请求参数
    const params = {
      fselected: selectedDate,
    };
  
    // 发送 GET 请求
    try {

      const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token

      const config = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      
      const response = await axios.get(process.env.REACT_APP_SERVER_URL + '/searchreport', {
        ...config,
        params,
        withCredentials: true
      });
      // 处理响应结果
      if (response.status === 200) {
        //console.log(response.data.results);
        setDashboard_data(response.data.results);
        setleaderboardData(response.data.itemSalesResults);
        setPaymentData(response.data.paymentResults);
        
        const { cashAmount, nonCashPayments } = processPaymentData(getPaymentData(), selectedDate);
        
        setCashAmount(cashAmount);
        setNonCashPayments(nonCashPayments);
        setBranchPaymentData(response.data.branchPaymentResults);
        console.log(response.data.branchPaymentResults);
          
        // setUser(response.data.username);
        setIsAdmin(response.data.isAdmin);
        setIsUserFetched(true);
        // navigate('/dashboard');
      }
    } catch (error) {
      console.log(error);
    }
  };


  const handleLogout = async () => {
    try {
      await axios.get(process.env.REACT_APP_SERVER_URL + '/logout', { withCredentials: true });
      setUser(null);
      sessionStorage.removeItem('jwtToken');
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };
  const addSpacesToCamelCase = (text) => {
    // 先把 "GST" 替换为一个占位符，例如 "__GST__"
    let processedText = text.replace(/GST/g, '__GST__');
    
    // 在其他大写字母前加空格
    processedText = processedText.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // 把占位符替换回 "GST"
    processedText = processedText.replace(/__GST__/g, 'GST ');
    
    return processedText;
  };
  
  

  useEffect(() => {
    const fetchData = async () => {

      try {
        const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token

        const config = {
          headers: {
            'authorization': `Bearer ${token}`
          }
        };
        
        const response = await axios.get(process.env.REACT_APP_SERVER_URL+'/dashboard', config); // 发送请求到服务器
        if (response.status !== 200) {
          handleLogout();
          return;
        }
        if (!response.data.isAdmin && response.data.results) {
          
          // console.log(response.data.results.NetSales);
          setDashboard_data(response.data.results);
          
          setleaderboardData(response.data.itemSalesResults);
          setPaymentData(response.data.paymentResults);
          
          setBranchPaymentData(response.data.branchPaymentResults);
          

          
          setUser(response.data.ClientNameResult);
          setLastestUpdate(formatDateTime(response.data.LastestReportUpdateTimeResult));
          
          setIsAdmin(response.data.isAdmin);
          setIsUserFetched(true);
          setIsLoading(false);
        } else {
          
          setIsLoading(false);
          setIsAdmin(response.data.isAdmin);
          setIsUserFetched(true);
          setDashboard_data(response.data.data);
        }
      } catch (error) {
        navigate('/');
        console.log(error);
        
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const { cashAmount, nonCashPayments } = processPaymentData(getPaymentData(), selectedDate);
    setCashAmount(cashAmount);
    setNonCashPayments(nonCashPayments);
  }, [getPaymentData(), selectedDate]);
  

  useEffect(() => {
    if (getIsUserFetched() && !getIsAdmin() && getDashboard_data()) {
      setIsLoading(false);
    }
  }, [getIsUserFetched(), getIsAdmin(), getDashboard_data()]);

  if (getIsLoading()) {
    return (
      <div className="loading-overlay">
        <CircularProgress className="loading-spinner" />
      </div>
    );
  } 
  


else if (!getIsLoading() && !getIsAdmin() ) {
 
  let selectedDateData = {};


  if (getDashboard_data()) {
    Object.entries(getDashboard_data()).forEach(([date, data]) => {
      const formattedDate = formatDate(date);
      if (formattedDate === selectedDate) {
        selectedDateData = data;
      }
      
    });
  }

  return (
    <div className="container">
      <Sidebar user={getUser()} onLogout={handleLogout} isOpen={isSidebarOpen} />
      <main>
        <div className="analyze-table">
          <h1>Dashboard</h1>
          <div className="date">
            <h2>Selected Date</h2>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
          <button className="ripple" onClick={handleSearch}>Search</button>
          <div className="daily-report">
            <h2>Daily Report</h2>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>
                  {isCurrentDate ? `Current Date: ${selectedDate}` : `Selected Date: ${selectedDate}`}
                </th>
              </tr>
            </thead>
            <tbody>
              {
                Object.keys(selectedDateData).map((key, index) => (
                  <tr key={index}>
                    <td className="left-align">{addSpacesToCamelCase(key)}</td>
                    <td className="custom-font-size">{typeof selectedDateData[key] === 'number' ? selectedDateData[key].toLocaleString() : selectedDateData[key] || 0}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          </div>
        </div>
        
      </main>
      <div className = 'right'>
        <div className='top'>
          <button id ="menu-btn">
            <span className='material-icons-sharp'>menu</span>
          </button>
          <div className='theme-toggler' onClick={handleThemeToggle}>
            <span className='material-icons-sharp active'>light_mode</span>
            <span className='material-icons-sharp'>dark_mode</span>
          </div>
          <div className='profile'>
            <div className='info'>
              <p>Hey, <b>{getUser()}</b></p>
              <small className='text-muted'>Last Updates: {lastestUpdate}</small>
            </div>  
            <div className='profile-photo'>
              <img src='./images/enrichIcon.jpg' />
            </div>
          </div>

        </div>
        <div className='rank'>
          <h2>Sales Item Ranking</h2>
          <div className='rank-list'>
            {leaderboardData && leaderboardData.date === selectedDate ? (
              <Leaderboard data={leaderboardData.results} />
            ) : (
              // 这里你可以放置其他的备选组件或者信息
              <Leaderboard data={[]} />
            )}
            
          </div>
        </div>
        <div className='payment-summary'>
            <h2>Payment Method Summary</h2>
            {paymentData && paymentData.date === selectedDate ? (
              <div className='payment-list'>
                <div className="cash-section">
                  <div className="icon">
                    <span className='material-icons-sharp'>payments</span>
                  </div>
                  <div className="cash-item">
                    <h3>CASH</h3>
                    <span className="cash-amount">${cashAmount.toFixed(2)}</span>
                  </div>
                </div>
                {nonCashPayments && nonCashPayments.length > 0 && (
                    <div className="non-cash-section">
                      <div className="icon">
                        <span className='material-icons-sharp'>credit_cards</span>
                      </div>
                      <table className="non-cash-table">
                        <tbody>
                          {nonCashPayments.map((payment, index) => (
                            <tr key={index}>
                              <td><h3>{payment.Description}</h3></td>
                              <td>${payment.Amount.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
              <div >
                {/* 如果 paymentData 不存在或者日期不匹配，你可以在这里放置备选内容 */}
              </div>
            )}

        </div>
        {Object.keys(getBranchPaymentData()).length > 0 && (
          <div className='branch-summary'>
            <h2>Branch Sales Summary</h2>
            {getBranchPaymentData().results.length > 0 && getBranchPaymentData().date === selectedDate ? (
              <div className='branch-section'>
                <div className="icon">
                  <span className='material-icons-sharp'>store</span>
                </div>
                <table className="branch-payment-table">
                  <tbody>
                    {getBranchPaymentData().results.map((payment, index) => (
                      <tr key={index}>
                        <td><h3>{payment.Description}</h3></td>
                        <td>${payment.TotalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              
              <div></div>
            )}

          </div>
        )}
        
      </div>

    </div>
  );
}

  else if (!getIsLoading() && getIsAdmin() && getIsUserFetched() && getDashboard_data()) {
    // Define connection options
    const connectionOptions = [
      { value: "", label: "All (Connection)" },
      { value: "1", label: "Connected" },
      { value: "0", label: "Disconnected" },
    ];
  
    // Define status options
    const statusOptions = [
      { value: "all", label: "All (Status)" }, // Add "all" option
      { value: "active", label: "Active" },
      { value: "expired", label: "Expired" },
      { value: "almost_expired", label: "Almost Expired (within 10 days)" },
    ];
  
    // Handle search input change
    const handleSearchChange = (event) => {
      setSearchValue(event.target.value);
    };
  
    // Handle connection change function
    const handleConnectionChange = (event) => {
      setSelectedConnection(event.target.value);
    };
  
    // Handle status change function
    const handleStatusChange = (event) => {
      setSelectedStatus(event.target.value);
    };
  
    // Filter data based on search value, selected connection, and selected status
    const filteredData = getDashboard_data().filter((item) => {
      const matchesSearch = String(item.store_id).includes(searchValue);
      const matchesConnection =
        selectedConnection === "" || String(item.connection) === selectedConnection;
  
      let status = "";
      const expiredDate = moment.utc(item.r_expired_date).local();
      const today = moment().startOf("day");
  
      if (expiredDate.isSameOrBefore(today)) {
        status = "expired";
      } else if (expiredDate.diff(today, "days") >= 10) {
        status = "active";
      } else {
        status = "almost_expired";
      }
  
      const matchesStatus =
        selectedStatus === "all" || selectedStatus === "" || status === selectedStatus;
  
      return matchesSearch && matchesConnection && matchesStatus;
    });
  
    const handleEdit = (storeId) => {
      navigate(`/edit-store?store=${storeId}`);
    };
  
    const handleHistory = (storeId) => {
      navigate(`/store-history?store=${storeId}`);
    };
  
    // Render the component
    return (
      <div className="container">
        <Adminsidebar user={getUser()} onLogout={handleLogout} isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <main>
        <div className="main-store">
          <div className="search-bar-container">
            <input
              className="search-bar"
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search Store ID"
            />
            <select value={selectedConnection} onChange={handleConnectionChange}>
              {connectionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select value={selectedStatus} onChange={handleStatusChange}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {filteredData.map((item) => {
            const expiredDate = moment.utc(item.r_expired_date).local();
            const today = moment().startOf("day");
            let status = "";
  
            if (expiredDate.isSameOrBefore(today)) {
              status = "expired";
            } else if (expiredDate.diff(today, "days") >= 10) {
              status = "active";
            } else {
              status = "almost_expired";
            }
  
            let statusClassName = "";
            if (status === "active") {
              statusClassName = "active-status";
            } else if (status === "almost_expired") {
              statusClassName = "almost-expired-status";
            } else if (status === "expired") {
              statusClassName = "expired-status";
            }
  
            return (
              <div key={item.store_id} className={`store ${statusClassName}`}>
                <div className="store-header">
                  {item.connection === 1 && <button disabled className="connected-button">Connected</button>}
                  {item.connection === 0 && <button disabled className="disconnected-button">Disconnected</button>}
                  <p>Client Socket ID: {item.client_socket_id}</p>
                </div>
                <p>
                  Expired Date:{" "}
                  <span className={`date ${status === "expired" ? "expired" : ""} ${status === "active" ? "active" : ""} ${status === "almost_expired" ? "almost_expired" : ""}`}>
                    {moment.utc(item.r_expired_date).local().format("DD/MM/YYYY")}
                  </span>
                </p>
                <p>Store ID: {item.store_id}</p>
                {item.report_function === 1 && (
                  <button disabled>Online Report</button>
                  // Add your chart component or other content here
                )}
                <button className="edit-button" onClick={() => handleEdit(item.store_id)}>Edit</button>
                <button className="history-button" onClick={() => handleHistory(item.store_id)}>History</button>
              </div>
            );
          })}
        </div>
        </main>
      </div>
    );
  }
};

export default Dashboardnew;
