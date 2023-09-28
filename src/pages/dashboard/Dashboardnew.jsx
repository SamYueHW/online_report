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
import Chart from '../../components/chart/Chart';


const Dashboardnew = () => {
  const [user, setUser, getUser] = useGetState(null);
  const [lastestUpdate, setLastestUpdate] = useState(null);
  const [isUserFetched, setIsUserFetched, getIsUserFetched] = useGetState(false);
  const [isAdmin, setIsAdmin, getIsAdmin] = useGetState(false);

  const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
  const [dashboard_data, setDashboard_data, getDashboard_data] = useGetState(null);
  const [hasBranch, setHasBranch] = useState(false);

  const [leaderboardData, setleaderboardData] = useState(null);


  const [paymentData, setPaymentData, getPaymentData] = useGetState(null);
  const [cashAmount, setCashAmount] = useState(0);
  const [nonCashPayments, setNonCashPayments] = useState([]);
  const [storeName, setStoreName] = useState(null);

  const [posVersion, setposVersion] = useState(null);
 

  const [branchPaymentData, setBranchPaymentData,getBranchPaymentData] = useGetState(null);
  
  const themeTogglerRef = useRef(null);  // 创建一个 ref

  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState('');
  const [selectedConnection, setSelectedConnection] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [defaultKeysToShow, setDefaultKeysToShow] = useState('');  // 默认显示的键的集合

    // 设置澳大利亚悉尼时区的当前日期
  const australiaDate = moment.tz('Australia/Sydney').format('YYYY-MM-DD');
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');

    // 当前日期状态
  const [selectedDate, setSelectedDate] = useState(australiaDate);
  const [tselectedDate, setTSelectedDate] = useState(australiaDate);

  // 判断 selectedDate 是否与当前日期相匹配
  const isCurrentDate =selectedDate === australiaDate && tselectedDate === australiaDate;
  const [showAll, setShowAll] = useState(false);

  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 935);
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth > 935);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  useEffect(() => {
    const australiaDate = moment.tz('Australia/Sydney').format('YYYY-MM-DD');
    const lastYearDate = moment.tz('Australia/Sydney').subtract(1, 'years').format('YYYY-MM-DD');

    setMinDate(lastYearDate);
    setMaxDate(australiaDate);
  }, []);

 
  const defaultKeysToShow_r = new Set(['TotalNetSales', 
  'TotalTransaction', 
  'TotalEftpos',
  'CashInTill',
  'NonSalesTillOpen',
  'AverageSales',
  'NegativeSalesAmount',
 ]);  // 你想默认显示的键的集合

 const defaultKeysToShow_h = new Set(['NetSales',
  'TotalTransaction',
  'TotalEftposPayment',
  'CashInDrawer',
  'NonSaleOpenDrawer',
  'AverageSales',
  'VoidAmount',
]);  // 你想默认显示的键的集合

useEffect(() => {
  if (posVersion === 0) {
    setDefaultKeysToShow(defaultKeysToShow_r);
  } else {
    setDefaultKeysToShow(defaultKeysToShow_h);
  }
}, [posVersion]);

  
// const processDashboardData = (dashboardData) => {
//   console.log(dashboardData);
//   let selectedTotalNetSales = 0;

//   try{
//     if (Array.isArray(dashboardData)) {
//     dashboardData.forEach(dashboardData => {
//       Object.entries(dashboardData).forEach(([dateRange, data]) => {
//         if (Array.isArray(data)) {
//         const [startDate, endDate] = dateRange.split(' - ');
  
//         // 对比日期并获取相应数据
//         if (startDate === formatDate(selectedDate) && endDate === formatDate(tselectedDate)) {
//           setSelectedTotalNetSalesDateRange({ startDate, endDate });
//           // 遍历 data 数组，累加 TotalNetSales
//           data.forEach(({ TotalNetSales }) => {
//             selectedTotalNetSales += TotalNetSales;
//           });
//           const totalNetSalesMap = new Map();
//           let currentDate = new Date(startDate);
//           const endDateObject = new Date(endDate);

//           while (currentDate <= endDateObject) {
//             const dateKey = currentDate.toLocaleDateString();
//             totalNetSalesMap.set(dateKey, 0);
//             currentDate.setDate(currentDate.getDate() + 1);
//           }
//           // 遍历 data 数组，更新 TotalNetSales
//           data.forEach(({ TotalNetSales, Date: SalesDate }) => {
//             const dateKey = new Date(SalesDate).toLocaleDateString();
//             totalNetSalesMap.set(dateKey, TotalNetSales);
//           });          
          
//         };
//       }
       
//       });
//     });
//     setSelectedTotalNetSales(selectedTotalNetSales);

//   }}
//   catch (error) {
//     console.log(error);
//     // navigate('/');
//   }
// };

  const pieChartData = [
    { name: 'CASH', value: parseFloat(cashAmount.toFixed(2)) },
    ...nonCashPayments.map(payment => ({
      name: payment.Description,
      value: parseFloat(payment.Amount.toFixed(2))
    }))
  ];



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
  
  const processPaymentData = (paymentData, selectedInput,tselectedInput) => {
    // console.log(paymentData);

    let cash = 0;
    const nonCash = [];

    
    const obj = paymentData[Object.keys(paymentData)[0]];
    if (Object.keys(obj).length === 0 && obj.constructor === Object) {
      return {
        cashAmount: 0,
        nonCashPayments: [],
      };
    } 

    Object.keys(paymentData).forEach(dateRangeKey => {
      const [startDate, endDate] = dateRangeKey.split(' - ');
      // console.log(startDate);
      // console.log(endDate);
      // console.log(selectedInput);
      // console.log(tselectedInput);
      if (startDate === selectedInput && endDate === tselectedInput) {
        paymentData[dateRangeKey].forEach(item => {
          if (item.Description.toUpperCase() === 'CASH') {
            cash = item.Amount;
          } else {
            nonCash.push(item);
          }
        });
      }

      else{
        return{
          cashAmount:0,
          nonCashPayments:[],
        }
      }
    });
   
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
    if (selectedDate === "" || tselectedDate === "") {
      alert("Please make sure [Selected Date] and [TSelected Date] have been filled in!");
      return;
    }
    
    if (new Date(selectedDate) > new Date(tselectedDate)) {
      alert("Please enter a valid date range for Selected Dates.");
      return;
    }
    // 构造请求参数
    const params = {
      fselected: selectedDate,
      tselected: tselectedDate
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
        // processDashboardData(response.data.results);
        // setposVersion(response.data.posVersion);
        setleaderboardData(response.data.itemSalesResults);
        setPaymentData(response.data.paymentResults);
        setHasBranch(response.data.hasBranchResult);

        const { cashAmount, nonCashPayments } = processPaymentData(response.data.paymentResults, selectedDate,tselectedDate);
   
       
        setCashAmount(cashAmount);
        setNonCashPayments(nonCashPayments);
        setBranchPaymentData(response.data.branchPaymentResults);
          
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
      navigate('/');
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
         // 构造请求参数
        const params = {
          fselected: selectedDate,
          tselected: tselectedDate
        };
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
        
        if (response.status !== 200) {
          handleLogout();
          return;
        }
        if (!response.data.isAdmin && response.data.results) {
          setposVersion(response.data.posVersion);
          // console.log(response.data.results.NetSales);
          setDashboard_data(response.data.results);
         
          //processDashboardData(response.data.results);

          setleaderboardData(response.data.itemSalesResults);
          
          setPaymentData(response.data.paymentResults);
          setHasBranch(response.data.hasBranchResult);
          // console.log(response.data.hasBranchResult)
          // console.log(response.data.paymentResults);
          
          const { cashAmount, nonCashPayments } = processPaymentData(response.data.paymentResults, selectedDate,tselectedDate);

          setCashAmount(cashAmount);
          setNonCashPayments(nonCashPayments);
          
          setBranchPaymentData(response.data.branchPaymentResults);


          setStoreName(response.data.StoreName);
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
        //handleLogout();
        console.log(error);
      }
    };
    fetchData();
  }, []);

  
  useEffect(() => {
    if (getIsUserFetched() && !getIsAdmin() && getDashboard_data() && getPaymentData()) {
      const { cashAmount, nonCashPayments } = processPaymentData(getPaymentData(), selectedDate, tselectedDate);
      setCashAmount(cashAmount);
      setNonCashPayments(nonCashPayments);
    }
   
  }, [tselectedDate, selectedDate]);
  

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
 

  return (

<div className="container">
<div className='sider'>
  <Sidebar key={hasBranch ? 'true' : 'false'} user={getUser()} onLogout={handleLogout} showSidebar={showSidebar} setShowSidebar={setShowSidebar}  hasBranch={hasBranch}/>
</div>
  <div className='main-layout'>
  <div className='header'>
    <button id ="menu-btn"  onClick={() => setShowSidebar(true)}>
        <span className='material-icons-sharp'>menu</span>
    </button>
    <div className='top'>

      {/* <div className='theme-toggler' onClick={handleThemeToggle}>
      <span className='material-icons-sharp active'>light_mode</span>
      <span className='material-icons-sharp'>dark_mode</span>
      </div> */}
      <div className='profile'>
        <div className='info'>
          <p>Hey, <b>{getUser()}</b> [{storeName.StoreName}]</p>
          <small className='text-muted'>Last Updates: {lastestUpdate}</small>
        </div>  
        <div className='profile-photo'>
          <img src='./images/enrichIcon.jpg' />
        </div>
      </div>
    </div>  
  </div>
  <div className='content'>
    <main className='main-content'>
      <div className='zdy-h'></div>
      <div className='left-column'>
        <div className="analyze-table">
        
          <h1>Dashboard</h1>
          <div className="date">
              <h2>Selected Date</h2>
              <input type="date" min={minDate} max={maxDate} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              to
              <input type="date" min={minDate} max={maxDate} value={tselectedDate} onChange={(e) => setTSelectedDate(e.target.value)} />
          </div>
          <button className="ripple" onClick={handleSearch}>Search</button>
          <div className="daily-report">
            <h2>Daily Report</h2>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>
                {
                  isCurrentDate ? 
                  <>
                    Current Date: <br />
                    {moment(selectedDate, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                  </> : 
                  (selectedDate === tselectedDate ? 
                  <>
                    Selected Date: <br />
                    {moment(selectedDate, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                  </> : 
                  <>
                    Selected Date Range: <br />
                    {moment(selectedDate, 'YYYY-MM-DD').format('DD/MM/YYYY')} to {moment(tselectedDate, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                  </>)
                }
              </th>
                </tr>
              </thead>
              <tbody>
          {
            Object.keys(getDashboard_data()).map((dateRangeKey, index) => {
              const [startDate, endDate] = dateRangeKey.split(' - ');

              if (startDate === selectedDate && endDate === tselectedDate && getDashboard_data()[dateRangeKey].length !== 0) {
                const dataForThisRange = getDashboard_data()[dateRangeKey][0];
                const keysToRender = showAll ? Object.keys(dataForThisRange) : Array.from(defaultKeysToShow);  // 根据 defaultKeysToShow 筛选

                // 计算 Discount
                const discount = (dataForThisRange['RedeemPoints'] || 0) + (dataForThisRange['ItemDiscount'] || 0) + (dataForThisRange['DollarDiscount'] || 0)+ (dataForThisRange['VoucherDiscount'] || 0);

                return (
                  <>
                    {keysToRender.map((key, innerIndex) => (
                      <tr key={innerIndex}>
                        <td className="left-align">
                          {key === 'NegativeSalesAmount' ? 'Void Sales Amount' : (key === 'NegativeSalesQty' ? 'Void Sales Qty' : addSpacesToCamelCase(key))}
                        </td>
                        <td className="custom-font-size">
                          {typeof dataForThisRange[key] === 'number' ? parseFloat(dataForThisRange[key].toFixed(2)).toLocaleString() : dataForThisRange[key] || '0'}
                        </td>
                      </tr>
                    ))}
                    {/* 添加 Discount 行 */}
                    {!showAll && (
                      <tr>
                        <td className="left-align">Total Discount</td>
                        <td className="custom-font-size">{parseFloat(discount.toFixed(2)).toLocaleString()}</td>
                      </tr>
                    )}
                  </>
                );
              }
              return null;
            })
          }
        </tbody>
            </table>
            <a href="#" onClick={() => setShowAll(!showAll)}>Show All</a>
          </div>
        </div>
      </div>
      <div className='right-column'>
    

        <div className = 'right'>
    <div className='rank'>
      <h2>Sales Ranking</h2>
      <div className='rank-list'>
        {(() => {
          // 初始化一个变量来保存匹配日期范围的数据
          let dataForLeaderboard = [];

          // 检查 leaderboardData 是否存在
          if (leaderboardData) {
            Object.keys(leaderboardData).forEach(dateRangeKey => {
              // 拆分日期范围为开始日期和结束日期
              const [startDate, endDate] = dateRangeKey.split(' - ');

              // 如果 startDate 和 endDate 匹配 selectedDate 和 tselectedDate，则保存这个日期范围的数据
              if (startDate === selectedDate && endDate === tselectedDate && leaderboardData[dateRangeKey].length !== 0) {
                dataForLeaderboard = leaderboardData[dateRangeKey];
              }
            });
          }

          // 渲染 Leaderboard 组件，并将匹配的数据传入
          return <Leaderboard data={dataForLeaderboard.length > 0 ? dataForLeaderboard : []} />;
        })()}
      </div>
    </div>
    <div className='payment-summary'>
        <h2>Payment Method Summary</h2>

        {nonCashPayments !== null && cashAmount !== null ? (
          <div className='payment-list'>
            <div className="non-cash-section">
            <div className="icon" style={{ background: "#7380ec" }}>
                <span className='material-icons-sharp'>payments</span>
              </div>
              <div className="non-cash-container">
                <div className="non-cash-row">
                  <div className="non-cash-description">
                    <h3>CASH</h3>
                    
                  </div>
                  <div className="non-cash-amount">${cashAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>
            {nonCashPayments && nonCashPayments.length > 0 && (
                <div className="non-cash-section">
                  <div className="icon">
                    <span className='material-icons-sharp'>credit_cards</span>
                  </div>
                  <div className="non-cash-container">
                    {nonCashPayments.map((payment, index) => (
                      <div key={index} className="non-cash-row">
                        <div className="non-cash-description">
                          <h3>{payment.Description}</h3>
                        </div>
                        <div className="non-cash-amount">
                          ${payment.Amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}
              {pieChartData && pieChartData.length > 0 && (
                <Chart title="Payment Method Analytics" data={pieChartData} />
              )}
            </div>
            
          ) : (
          <div >
            {/* 如果 paymentData 不存在或者日期不匹配，你可以在这里放置备选内容 */}
          </div>
        )}
    </div>



    
    
      </div>
  </div>
  </main>
</div>
<div className="footer">
      {/* 你的底部代码 */}
  </div>


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
