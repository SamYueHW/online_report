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
import SalesPieChart from '../../components/chart/SalesPieChart';  



const Dashboardnew = () => {
  const [user, setUser, getUser] = useGetState(null);
  const [lastestUpdate, setLastestUpdate] = useState(null);
  const [isUserFetched, setIsUserFetched, getIsUserFetched] = useGetState(false);
  const [isAdmin, setIsAdmin, getIsAdmin] = useGetState(false);
  const [lastWeekNetSales , setlastWeekNetSales] = useState(null);

  const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
  const [dashboard_data, setDashboard_data, getDashboard_data] = useGetState(null);
  const [hasBranch, setHasBranch] = useState(false);

  const [leaderboardData, setleaderboardData] = useState(null);
  const [groupItemSalesData, setGroupItemSalesData] = useState(null);
  const [SalesPieChartData, setSalesPieChartData] = useState(null);
  const [groupItemSalesPieChartData, setGroupItemSalesPieChartData] = useState(null);

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


  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  // 用于保存表单输入的状态
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: ''
  });
  const [confirmPassword, setConfirmPassword] = useState(''); 

  const [passwordMismatchWarning, setPasswordMismatchWarning] = useState(false); // 新增状态
  
  // 新增函数，用于检查密码是否匹配
  const checkPasswordsMatch = () => {
    if (passwordData.newPassword !== confirmPassword) {
      setPasswordMismatchWarning(true);
    } else {
      setPasswordMismatchWarning(false);
    }
  };

  // 处理密码更改表单的提交
  const handleChangePassword = async () => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_SERVER_URL + '/updatePassword', 
        passwordData,
        {
          headers: {
            'authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`
          },
          withCredentials: true
        }
      );
      if (response.status === 200) {
        alert('Password changed successfully');
        setIsChangePasswordModalOpen(false);
        handleLogout();
      } else {
        alert('Failed to change the password');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to change the password');
    }
  };



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
 ]); 

 const defaultKeysToShow_h = new Set(['NetSales',
  'TotalTransaction',
  'TotalEftposPayment',
  'CashInDrawer',
  'NonSaleOpenDrawer',
  'AverageSales',
  'VoidAmount',
]); 

useEffect(() => {
  if (posVersion === 0) {
    setDefaultKeysToShow(defaultKeysToShow_r);
  } else {
    setDefaultKeysToShow(defaultKeysToShow_h);
  }
}, [posVersion]);

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

        setposVersion(response.data.PosVersion);
        setDashboard_data(response.data.results);
        setleaderboardData(response.data.itemSalesResults);
        setPaymentData(response.data.paymentResults);
        setHasBranch(response.data.hasBranchResult);

        const { cashAmount, nonCashPayments } = processPaymentData(response.data.paymentResults, selectedDate,tselectedDate);
        
        setSalesPieChartData(processItemSalesResults(response.data.itemSalesResults)); 
        setGroupItemSalesData(response.data.groupItemSalesResults);
        setGroupItemSalesPieChartData(processItemSalesResults(response.data.groupItemSalesResults));
        setlastWeekNetSales(response.data.lastWeekNetSalesResult);

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
      navigate('/');
      
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
  
  const processItemSalesResults = (itemSalesResults) => {
    const firstKey = Object.keys(itemSalesResults)[0];  // 获取第一个键
    
    const salesData = itemSalesResults[firstKey];  // 使用第一个键来获取销售数据
    
    if (salesData && Object.keys(salesData).length === 0) {
      return [];  // 如果是对象并且没有销售数据（对象为空），则返回空数组
    }
    
    // 计算总销售额
    const totalAmount = salesData.reduce((total, item) => total + item.Amount, 0);
    
    // 添加占比信息并保留两位小数
    return salesData.map(item => ({
      Description: item.Description || item.ItemGroup || 'N/A',
      Amount: Number(item.Amount.toFixed(2)),
      Percentage: Number((item.Amount / totalAmount * 100).toFixed(2))
    }));
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

          setposVersion(response.data.PosVersion);
          
          // console.log(response.data.results.NetSales);
          setDashboard_data(response.data.results);

         
          //processDashboardData(response.data.results);

          setleaderboardData(response.data.itemSalesResults);
          setGroupItemSalesData(response.data.groupItemSalesResults);
   
          setSalesPieChartData(processItemSalesResults(response.data.itemSalesResults)); 
          setGroupItemSalesPieChartData(processItemSalesResults(response.data.groupItemSalesResults));

          
          
          setPaymentData(response.data.paymentResults);
          setHasBranch(response.data.hasBranchResult);
         
          
          const { cashAmount, nonCashPayments } = processPaymentData(response.data.paymentResults, selectedDate,tselectedDate);

          setCashAmount(cashAmount);
          setNonCashPayments(nonCashPayments);
          
          setBranchPaymentData(response.data.branchPaymentResults);

   
          setStoreName(response.data.StoreName);
          setUser(response.data.ClientNameResult);
          setLastestUpdate(formatDateTime(response.data.LastestReportUpdateTimeResult));
          setlastWeekNetSales(response.data.lastWeekNetSalesResult);
          
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
    if (getIsUserFetched() && !getIsAdmin() && getDashboard_data() && getPaymentData()) {
      const { cashAmount, nonCashPayments } = processPaymentData(getPaymentData(), selectedDate, tselectedDate);
      setCashAmount(cashAmount);
      setNonCashPayments(nonCashPayments);
    }
   
  }, [tselectedDate, selectedDate]);
  
  useEffect(() => {
    checkPasswordsMatch();
  }, [passwordData.newPassword, confirmPassword]);
  
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
  <Sidebar key={hasBranch ? 'true' : 'false'} user={getUser()} onLogout={handleLogout} showSidebar={showSidebar} setShowSidebar={setShowSidebar}  hasBranch={hasBranch}  isChangePasswordModalOpen={isChangePasswordModalOpen} posVersion={posVersion}
          setIsChangePasswordModalOpen={setIsChangePasswordModalOpen}/>
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
              {' '} to {' '} 
              <input type="date" min={minDate} max={maxDate} value={tselectedDate} onChange={(e) => setTSelectedDate(e.target.value)} />
          </div>
          <button className="ripple" onClick={handleSearch}>Search</button>
          <div className="daily-report">
            <h2>Daily Report</h2>

            {isChangePasswordModalOpen && (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Change Password</h2>
        <label>
          Old Password: <input type="password" style={{ width: '150px' }} value={passwordData.oldPassword} 
                 onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} />
        </label>
        <label>
  New Password: <input 
    type="password" 
    style={{ width: '150px' }} 
    value={passwordData.newPassword} 
    onChange={(e) => {
      setPasswordData({ ...passwordData, newPassword: e.target.value });
      checkPasswordsMatch();  // 在这里也检查密码是否匹配
    }} 
  />
</label>
        <label>
          Confirm Password: <input type="password" style={{ width: '150px' }} value={confirmPassword} 
                 onChange={(e) => { 
                   setConfirmPassword(e.target.value);
                   checkPasswordsMatch(); // 检查密码是否匹配
                 }} />
        </label>
        {passwordMismatchWarning && <span style={{ color: 'red' }}>Passwords do not match</span>}
        <button className='change-pass' onClick={handleChangePassword}>Submit</button>
        <button className='change-pass' onClick={() => setIsChangePasswordModalOpen(false)}>Cancel</button>
      </div>
    </div>
  )}
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
              let oneday=0;
              if (startDate === endDate){
                oneday =1;
              }

              
              if (startDate === selectedDate && endDate === tselectedDate && getDashboard_data()[dateRangeKey].length !== 0) {
                const dataForThisRange = getDashboard_data()[dateRangeKey][0];
                const keysToRender = showAll ? Object.keys(dataForThisRange) : Array.from(defaultKeysToShow);  // 根据 defaultKeysToShow 筛选
                let discount = 0;
                if(posVersion === 0){
                  // 计算 Discount
                  discount = (dataForThisRange['RedeemPoints'] || 0) + (dataForThisRange['ItemDiscount'] || 0) + (dataForThisRange['DollarDiscount'] || 0)+ (dataForThisRange['VoucherDiscount'] || 0);
                }
                else{
                  discount = (dataForThisRange['TotalDiscount'] || 0) + (dataForThisRange['VoucherDiscount'] || 0);
                }
                

                return (
                  <><React.Fragment key={index}>
                    {keysToRender.map((key, innerIndex) => (
                      <tr key={innerIndex}>
                        <td className="left-align">
                          {key === 'NegativeSalesAmount' ? 'Void Sales Amount' : (key === 'NegativeSalesQty' ? 'Void Sales Qty' : addSpacesToCamelCase(key))}
                        </td>
                        <td className="custom-font-size">
                          {typeof dataForThisRange[key] === 'number' ? parseFloat(dataForThisRange[key].toFixed(2)).toLocaleString() : dataForThisRange[key] || '0'}
                          {((key === 'TotalNetSales' || key === 'NetSales') && oneday === 1) && (
                              <span>
                                {'  '}
                                {(() => {
                                  const percentChange = (-(lastWeekNetSales - dataForThisRange[key]) / lastWeekNetSales * 100).toFixed(2);
                                  let color;
                                  let arrow;

                                  if (percentChange > 0) {
                                    color = 'green';
                                    arrow = <span className="material-icons-sharp" style={{ fontSize: '13px', verticalAlign: 'middle' }}>arrow_upward</span>;
                                  } else if (percentChange < 0) {
                                    color = 'red';
                                    arrow = <span className="material-icons-sharp" style={{ fontSize: '13px',verticalAlign: 'middle' }}>arrow_downward</span>;
                                  } else {
                                    color = 'black';
                                    arrow = '   ';
                                  } 

                                  return (
                                    <span style={{ color, fontSize: 'small' , fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                    {arrow}{isNaN(percentChange) || !isFinite(percentChange) ? 'N/A%' : `${percentChange}%`}
                                    </span>
                                  );
                                })()}
                              </span>
                            )}
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
                  </React.Fragment>
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

        {posVersion === 1 && (
  <div className='rank'>
    <h2>Item Group Sales</h2>
    <div className='rank-list'>
      {(() => {
        let dataForGroupItemSales = [];
        if (groupItemSalesData) {
          Object.keys(groupItemSalesData).forEach(dateRangeKey => {
            const [startDate, endDate] = dateRangeKey.split(' - ');
            if (startDate === selectedDate && endDate === tselectedDate && groupItemSalesData[dateRangeKey].length !== 0) {
              dataForGroupItemSales = groupItemSalesData[dateRangeKey];
            }
          });
        }
        return <Leaderboard data={dataForGroupItemSales.length > 0 ? dataForGroupItemSales : []} showRank={false} />;
      })()}
    </div>
    <SalesPieChart data={groupItemSalesPieChartData} />
  </div>
)}

    <div className='rank'>
    <h2>
        {posVersion === 1 ? "Item Sales Ranking" : "Category Sales Ranking"}
      </h2>
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
          return <Leaderboard data={dataForLeaderboard.length > 0 ? dataForLeaderboard : []} showRank={true}  />;
        })()}
      </div>
      <SalesPieChart data={SalesPieChartData} />
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

};

export default Dashboardnew;
