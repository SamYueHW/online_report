import axios from 'axios';
import React, { useState, useEffect } from 'react';
// import "./dashboardnew.scss";
import Sidebar from '../../components/sidebar/Sidebarnew';
import Adminsidebar from '../../components/sidebar/Adminsidebar';
import { useNavigate } from 'react-router-dom';
import useGetState from '../../hooks/useGetState';
import moment from 'moment-timezone';
import { CircularProgress } from '@mui/material';

import Dropdown from '../../components/dropdown/Dropdown';
import Mchart from '../../components/mchart/Mchart';

const SalesSummary = () => {
  const [user, setUser, getUser] = useGetState(null);
  const [isUserFetched, setIsUserFetched, getIsUserFetched] = useGetState(false);
  const [isAdmin, setIsAdmin, getIsAdmin] = useGetState(false);

  const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
  const [dashboard_data, setDashboard_data, getDashboard_data] = useGetState(null);
  const [NetSalesByDate, setNetSalesByDate] = useState({xAxisData1: [],yAxisData1: [],xAxisData2: [],yAxisData2: [],});

  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [selectedTotalNetSales, setSelectedTotalNetSales] = useState(0);
  const [comparedTotalNetSales, setComparedTotalNetSales] = useState(0);

  const [selectedTotalNetSalesDateRange, setSelectedTotalNetSalesDateRange] = useState(null);
  const [comparedTotalNetSalesDateRange, setComparedTotalNetSalesDateRange] = useState(null);

  const [hasBranch, setHasBranch] = useState(false);

    // 设置澳大利亚悉尼时区的当前日期
  const australiaDate = moment.tz('Australia/Sydney').format('YYYY-MM-DD');
  const dateOptions = ["Daily", "Weekly", "Monthly", "Yearly"];

  const [dateType, setDateType] = useState("Weekly");

  
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





    // 当前日期状态
  const [selectedDate, setSelectedDate] = useState(australiaDate);
  const [tselectedDate, setTSelectedDate] = useState(australiaDate);
  const [comparedDate, setComparedDate] = useState('');
  const [tcomparedDate, setTComparedDate] = useState('');
  

  // 判断 selectedDate 是否与当前日期相匹配
  const isCurrentDate =selectedDate === australiaDate && tselectedDate === australiaDate;

  const formatDate = (dateString) => {
    return moment(new Date(dateString)).format('YYYY-MM-DD');
  };


  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 820);
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth > 820);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

    
const processDashboardData = (dashboardData) => {
  let selectedTotalNetSales = 0;
  let comparedTotalNetSales = 0;

  let x1Data = [];
  let y1Data = [];
  let x2Data = [];
  let y2Data = [];
  try{
    if (Array.isArray(dashboardData)) {
    dashboardData.forEach(dashboardData => {
      Object.entries(dashboardData).forEach(([dateRange, data]) => {
        if (Array.isArray(data)) {
        const [startDate, endDate] = dateRange.split(' - ');
  
        // 对比日期并获取相应数据
        if (startDate === formatDate(selectedDate) && endDate === formatDate(tselectedDate)) {
          setSelectedTotalNetSalesDateRange({ startDate, endDate });
          // 遍历 data 数组，累加 TotalNetSales
          data.forEach(({ TotalNetSales }) => {
            selectedTotalNetSales += TotalNetSales;
          });
          const totalNetSalesMap = new Map();
          let currentDate = new Date(startDate);
          const endDateObject = new Date(endDate);

          while (currentDate <= endDateObject) {
            const dateKey = currentDate.toLocaleDateString();
            totalNetSalesMap.set(dateKey, 0);
            currentDate.setDate(currentDate.getDate() + 1);
          }
          // 遍历 data 数组，更新 TotalNetSales
          data.forEach(({ TotalNetSales, Date: SalesDate }) => {
            const dateKey = new Date(SalesDate).toLocaleDateString();
            totalNetSalesMap.set(dateKey, TotalNetSales);
          });          
          if (dateType==="Weekly"){
            for (const [SalesDate, sales] of totalNetSalesMap.entries()) {
              const dateParts = SalesDate.split('/');
              const formattedDate = `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;
              
              x1Data.push(formattedDate); // 使用格式化后的日期
              y1Data.push(parseFloat(sales.toFixed(2)));
            }
          }
          else if (dateType === "Yearly") {
            const monthlySales = new Map();
            let year = null;
          
            for (const [SalesDate, sales] of totalNetSalesMap.entries()) {
              const dateObject = new Date(SalesDate);
              year = dateObject.getFullYear();  // 获取年份
              const month = dateObject.getMonth(); // 获取月份（0 = 一月, 1 = 二月, ...）
          
              // 如果这个月份还没有添加到 monthlySales 中，则初始化为0
              if (!monthlySales.has(month)) {
                monthlySales.set(month, 0);
              }
          
              // 累加这个月的销售额
              monthlySales.set(month, monthlySales.get(month) + sales);
            }
          
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          
            // 将每个月的累计销售额添加到 x1Data 和 y1Data 中
            for (const [month, sales] of monthlySales.entries()) {
              x1Data.push(`${monthNames[month]} ${year}`);  // 在这里加上了年份
              y1Data.push(parseFloat(sales.toFixed(2)));
            }
          }

        };
        if (startDate === formatDate(comparedDate) && endDate === formatDate(tcomparedDate)) {
          setComparedTotalNetSalesDateRange({ startDate, endDate });
           // 遍历 data 数组，累加 TotalNetSales
           data.forEach(({ TotalNetSales }) => {
            comparedTotalNetSales += TotalNetSales;
          });
          const totalNetSalesMap = new Map();
          let currentDate = new Date(startDate);
          const endDateObject = new Date(endDate);

          while (currentDate <= endDateObject) {
            const dateKey = currentDate.toLocaleDateString();
            totalNetSalesMap.set(dateKey, 0);
            currentDate.setDate(currentDate.getDate() + 1);
          }
          // 遍历 data 数组，更新 TotalNetSales
          data.forEach(({ TotalNetSales, Date: SalesDate }) => {
            const dateKey = new Date(SalesDate).toLocaleDateString();
            totalNetSalesMap.set(dateKey, TotalNetSales);
          });          

      
          
          if (dateType==="Weekly"){
            for (const [SalesDate, sales] of totalNetSalesMap.entries()) {
              
                const dateParts = SalesDate.split('/');
                const formattedDate = `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;
                
                x2Data.push(formattedDate); // 使用格式化后的日期
                y2Data.push(parseFloat(sales.toFixed(2)));
            }
            }
          //  else if (dateType === "Monthly") {
          //   let weeklySales = 0;
          //   let weekStart = null;
          //   let weekEnd = null;
          //   let dayCounter = 0;
          
          //   for (const [SalesDate, sales] of totalNetSalesMap.entries()) {
          //     const dateObject = new Date(SalesDate);
          //     const dayOfWeek = dateObject.getDay(); // 获取星期几（0 = 星期日, 1 = 星期一, ...）
          
          //     // 如果是周一，设置 weekStart
          //     if (dayOfWeek === 1) {
          //       weekStart = SalesDate;
          //     }
          //     // 累加本周的销售额
          //     weeklySales += sales;
          
          //     // 如果是周日，设置 weekEnd 并保存数据
          //     if (dayOfWeek === 0) {
          //       weekEnd = SalesDate;
          //       x1Data.push(`${weekStart} - ${weekEnd}`);
          //       y1Data.push(weeklySales);
          //       // 重置相关变量
          //       weeklySales = 0;
          //       weekStart = null;
          //       weekEnd = null;
          //     }
          //     dayCounter++;
          
          //     // 如果到达最后一天但还没有到周日
          //     if (dayCounter === totalNetSalesMap.size && dayOfWeek !== 0) {
          //       weekEnd = SalesDate;
          //       x1Data.push(`${weekStart} - ${weekEnd}`);
          //       y1Data.push(weeklySales);
          //     }
          //   }
          // }
          else if (dateType === "Yearly") {
            const monthlySales = new Map();
            let year = null;
          
            for (const [SalesDate, sales] of totalNetSalesMap.entries()) {
              const dateObject = new Date(SalesDate);
              year = dateObject.getFullYear();  // 获取年份
              const month = dateObject.getMonth(); // 获取月份（0 = 一月, 1 = 二月, ...）
          
              // 如果这个月份还没有添加到 monthlySales 中，则初始化为0
              if (!monthlySales.has(month)) {
                monthlySales.set(month, 0);
              }
          
              // 累加这个月的销售额
              monthlySales.set(month, monthlySales.get(month) + sales);
            }
          
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          
            // 将每个月的累计销售额添加到 x1Data 和 y1Data 中
            for (const [month, sales] of monthlySales.entries()) {
              x2Data.push(`${monthNames[month]} ${year}`);  // 在这里加上了年份
              y2Data.push(parseFloat(sales.toFixed(2)));
            }
          }
        }}
       
      });
    });
    setSelectedTotalNetSales(selectedTotalNetSales);
    setComparedTotalNetSales(comparedTotalNetSales);

    setNetSalesByDate({xAxisData1: x1Data,yAxisData1: y1Data,xAxisData2: x2Data,yAxisData2: y2Data,});

  }}
  catch (error) {
    console.log(error);
    navigate('/');
  }
}

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
    
    if (comparedDate && tcomparedDate && new Date(comparedDate) > new Date(tcomparedDate)) {
      alert("Please enter a valid date range for Compared Dates.");
      return;
    }
// 构造请求参数
    const params = {
      fselected: selectedDate,
      tselected: tselectedDate, // 你可以根据需要修改这个值
      fcompared: comparedDate,
      tcompared: tcomparedDate // 你可以根据需要修改这个值
    }

    // 发送 GET 请求
    try {
      const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
      const config = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      const response = await axios.get(process.env.REACT_APP_SERVER_URL + '/searchSalesSummary', {
        ...config,
        params,
        withCredentials: true
      });
      // 处理响应结果
      if (response.status === 200) {
        // console.log(response.data.results);
        setDashboard_data(response.data.results);
        setHasBranch(response.data.hasBranchResult);
        
        processDashboardData(response.data.results);
     
        // setUser(response.data.username);
        setIsAdmin(response.data.isAdmin);
        setIsUserFetched(true);
        
      }
    } catch (error) {
      navigate('/');
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
  



  const handleSelectedDateChange = (selectedDate) => {
    if (dateType === "Daily") {
      setSelectedDate(selectedDate);
      setTSelectedDate(selectedDate);
    }
    else if (dateType === "Weekly") {
      const startOfWeek = moment(selectedDate).startOf('isoWeek').format('YYYY-MM-DD');
      const endOfWeek = moment(selectedDate).endOf('isoWeek').format('YYYY-MM-DD');
      setSelectedDate(startOfWeek);
      setTSelectedDate(endOfWeek);
    } 
    else if (dateType === "Monthly") {
      const startOfMonth = moment(selectedDate).startOf('month').format('YYYY-MM-DD');
      const endOfMonth = moment(selectedDate).endOf('month').format('YYYY-MM-DD');
      setSelectedDate(startOfMonth);
      setTSelectedDate(endOfMonth);
    }

    else if (dateType === "Yearly") {
      const startOfYear = moment(selectedDate).startOf('year').format('YYYY-MM-DD');
      const endOfYear = moment(selectedDate).endOf('year').format('YYYY-MM-DD');
      setSelectedDate(startOfYear);
      setTSelectedDate(endOfYear);
    }
  };
  
  
  const handleComparedDateChange = (selectedDate) => {
    let comparedStartDate = "";
    let comparedEndDate = "";
  
    if (dateType === "Daily") {
      comparedStartDate = moment(selectedDate).subtract(1, 'days').format('YYYY-MM-DD');
      comparedEndDate = comparedStartDate;
    } 
    else if (dateType === "Weekly") {
      comparedStartDate = moment(selectedDate).subtract(1, 'weeks').startOf('isoWeek').format('YYYY-MM-DD');
      comparedEndDate = moment(selectedDate).subtract(1, 'weeks').endOf('isoWeek').format('YYYY-MM-DD');
    } 
    else if (dateType === "Monthly") {
      comparedStartDate = moment(selectedDate).subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
      comparedEndDate = moment(selectedDate).subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
    }
    else if (dateType === "Yearly") {
      comparedStartDate = moment(selectedDate).subtract(1, 'years').startOf('year').format('YYYY-MM-DD');
      comparedEndDate = moment(selectedDate).subtract(1, 'years').endOf('year').format('YYYY-MM-DD');
    }
    setComparedDate(comparedStartDate);
    setTComparedDate(comparedEndDate);
  };


  
  useEffect(() => {
    // 这里是初始化日期的逻辑
    processDashboardData([]);

    // 根据 dateType 来初始化日期
    if (dateType === "Daily") {
      handleSelectedDateChange(australiaDate);
      handleComparedDateChange();


    } 
    else if (dateType === "Weekly") {
      handleSelectedDateChange(australiaDate);
      handleComparedDateChange();

    } 
    else if (dateType === "Monthly") {
      handleSelectedDateChange(australiaDate);
      handleComparedDateChange();

    }

    else if (dateType === "Yearly") {
      handleSelectedDateChange(australiaDate);
      handleComparedDateChange();

    }
    
    
  }, [dateType]);  // 依赖于 dateType


  useEffect(() => {
    const fetchData = async () => {

      try {
        const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token

        const config = {
          headers: {
            'authorization': `Bearer ${token}`
          }
        };
        
        const params = {
          fselected: moment.tz(australiaDate, 'Australia/Sydney').startOf('isoWeek').format('YYYY-MM-DD'),
          tselected: moment.tz(australiaDate, 'Australia/Sydney').endOf('isoWeek').format('YYYY-MM-DD'), // 你可以根据需要修改这个值
          fcompared: moment.tz(australiaDate, 'Australia/Sydney').subtract(1, 'weeks').startOf('isoWeek').format('YYYY-MM-DD'),
          tcompared: moment.tz(australiaDate, 'Australia/Sydney').subtract(1, 'weeks').endOf('isoWeek').format('YYYY-MM-DD') // 你可以根据需要修改这个值
        
         
        };
        const response = await axios.get(process.env.REACT_APP_SERVER_URL + '/searchSalesSummary', {
          ...config,
          params,
          withCredentials: true
        });

        if (!response.data.isAdmin) {
          setIsLoading(false);
          setDashboard_data(response.data.results);
          processDashboardData(response.data.results);
          setHasBranch(response.data.hasBranchResult);
          
          // setUser(response.data.username);
          setIsAdmin(response.data.isAdmin);
          setIsUserFetched(true);
          console.log(response.data);
          

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


  

  return (
    <div className="container">
      <div className='sider'>
      <Sidebar key={hasBranch ? 'true' : 'false'} user={getUser()} onLogout={handleLogout} showSidebar={showSidebar} setShowSidebar={setShowSidebar}  hasBranch={hasBranch}  isChangePasswordModalOpen={isChangePasswordModalOpen} 
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
          {/* <div className='profile'>
            <div className='info'>
              <p>Hey, <b>{getUser()}</b> [{storeName.StoreName}]</p>
              <small className='text-muted'>Last Updates: {lastestUpdate}</small>
            </div>  
            <div className='profile-photo'>
              <img src='./images/enrichIcon.jpg' />
            </div>
          </div> */}
        </div>  
      </div>
      <div className='content'>
      <main className='main-content' >
      <div className='zdy-h'></div>
        
      <div className='left-column'>
        <div className="analyze-table">
          <h1>Sales Summary</h1>
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
          <Dropdown selected={dateType} setSelected={setDateType} options={dateOptions} />
          <div className="date">
            <h2>Selected Date</h2>
            <input type="date" value={selectedDate} onChange={(e) => handleSelectedDateChange(e.target.value)} />
            {dateType !== "Daily" && (
              <>
                to
                <input type="date" value={tselectedDate} onChange={(e) => handleSelectedDateChange(e.target.value)} />
              </>
            )}
          </div>

          <div className="date">
            <h2>Compared Date</h2>
            <input type="date" value={comparedDate} onChange={(e) => handleComparedDateChange(e.target.value)} />
            {dateType !== "Daily" && (
              <>
                to
                <input type="date" value={tcomparedDate} onChange={(e) => handleComparedDateChange(e.target.value)} />
              </>
            )}
          </div>

          <button className="ripple" onClick={handleSearch}>Search</button>
          <div className='daily-report'>
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

          {
            (comparedDate && tcomparedDate ) && (
              <th>
                {
                  comparedDate === tcomparedDate ? 
                  <>
                    Compared Date: <br />
                    {moment(comparedDate, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                  </> : 
                  <>
                    Compared Date Range: <br />
                    {moment(comparedDate, 'YYYY-MM-DD').format('DD/MM/YYYY')} to {moment(tcomparedDate, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                  </>
                }
              </th>

            )
          }

          </tr>
        </thead>
        <tbody>
        {
  (
    selectedTotalNetSalesDateRange && 
    selectedTotalNetSalesDateRange.startDate === formatDate(selectedDate) && 
    selectedTotalNetSalesDateRange.endDate === formatDate(tselectedDate) && 
    typeof selectedTotalNetSales === 'number'
  ) && (
    <tr>
      <td className="left-align">Total Net Sales</td>
      <td>{selectedTotalNetSales.toLocaleString()}</td>
      {
        (
          comparedTotalNetSalesDateRange && 
          comparedTotalNetSalesDateRange.startDate === formatDate(comparedDate) &&
          comparedTotalNetSalesDateRange.endDate === formatDate(tcomparedDate) && comparedDate && tcomparedDate &&
          typeof comparedTotalNetSales === 'number'
        ) ? 
        <td>{comparedTotalNetSales.toLocaleString()}</td> : <td> 0 </td>
      }
    </tr>
  )
}

        </tbody>
          </table>
          </div>
          
        </div> 
      </div>
      <div className='right-column'>
      <div className='right'>
            <div className='rank'>
          {
            dateType === "Weekly" || dateType ==='Yearly' ?
            (
              <>
                <h2>Sales Summary Chart</h2>
                <div className='chart'>
                  <Mchart dateType={dateType} data={NetSalesByDate} />
                </div>
              </>
            )
            : null
          }
            </div>
          </div>
          </div>
          </main>
          </div>
      </div>
    </div>
  );


};

export default SalesSummary;