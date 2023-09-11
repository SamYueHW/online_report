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

const SalesSummary = () => {
  const [user, setUser, getUser] = useGetState(null);
  const [isUserFetched, setIsUserFetched, getIsUserFetched] = useGetState(false);
  const [isAdmin, setIsAdmin, getIsAdmin] = useGetState(false);

  const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
  const [dashboard_data, setDashboard_data, getDashboard_data] = useGetState(null);

  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 

    // 设置澳大利亚悉尼时区的当前日期
  const australiaDate = moment.tz('Australia/Sydney').format('YYYY-MM-DD');
  const dateOptions = ["Daily", "Weekly", "Monthly"];

  const [dateType, setDateType] = useState("Daily");


    // 当前日期状态
  const [selectedDate, setSelectedDate] = useState(australiaDate);
  const [tselectedDate, setTSelectedDate] = useState(australiaDate);

  const [comparedDate, setComparedDate] = useState('');
  const [tcomparedDate, setTComparedDate] = useState('');
  // 判断 selectedDate 是否与当前日期相匹配
  const isCurrentDate = selectedDate === australiaDate && tselectedDate === australiaDate;

  const formatDate = (dateString) => {
    return moment(new Date(dateString)).format('YYYY-MM-DD');
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
    };
  
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
        console.log(response.data.results);
     
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
    // else if (dateType === "Quarterly") {
    //   const startOfQuarter = moment(selectedDate).startOf('quarter').format('YYYY-MM-DD');
    //   const endOfQuarter = moment(selectedDate).endOf('quarter').format('YYYY-MM-DD');
    //   setSelectedDate(startOfQuarter);
    //   setTSelectedDate(endOfQuarter);
    // }
    else if (dateType === "Yearly") {
      const startOfYear = moment(selectedDate).startOf('year').format('YYYY-MM-DD');
      const endOfYear = moment(selectedDate).endOf('year').format('YYYY-MM-DD');
      setSelectedDate(startOfYear);
      setTSelectedDate(endOfYear);
    }
  };
  
  
  const handleComparedDateChange = (selectedDate) => {
    if (!selectedDate) {
      setComparedDate('');
      setTComparedDate('');
      return;
    }
  
    if (dateType === "Daily") {
      setComparedDate(selectedDate);
      setTComparedDate(selectedDate);
    }
    else if (dateType === "Weekly") {
      const startOfWeek = moment(selectedDate).startOf('isoWeek').format('YYYY-MM-DD');
      const endOfWeek = moment(selectedDate).endOf('isoWeek').format('YYYY-MM-DD');
      setComparedDate(startOfWeek);
      setTComparedDate(endOfWeek);
    } 
    else if (dateType === "Monthly") {
      const startOfMonth = moment(selectedDate).startOf('month').format('YYYY-MM-DD');
      const endOfMonth = moment(selectedDate).endOf('month').format('YYYY-MM-DD');
      setComparedDate(startOfMonth);
      setTComparedDate(endOfMonth);
      
    }
    // else if (dateType === "Quarterly") {
    //   const startOfQuarter = moment(selectedDate).startOf('quarter').format('YYYY-MM-DD');
    //   const endOfQuarter = moment(selectedDate).endOf('quarter').format('YYYY-MM-DD');
    //   setComparedDate(startOfQuarter);
    //   setTComparedDate(endOfQuarter);
    // }
    else if (dateType === "Yearly") {
      const startOfYear = moment(selectedDate).startOf('year').format('YYYY-MM-DD');
      const endOfYear = moment(selectedDate).endOf('year').format('YYYY-MM-DD');
      setComparedDate(startOfYear);
      setTComparedDate(endOfYear);
    }
  };
  useEffect(() => {
    // 这里是初始化日期的逻辑
  

    // 根据 dateType 来初始化日期
    if (dateType === "Daily") {
      handleSelectedDateChange(australiaDate);
      handleComparedDateChange("");


    } 
    else if (dateType === "Weekly") {
      handleSelectedDateChange(australiaDate);
      handleComparedDateChange("");

    } 
    else if (dateType === "Monthly") {
      handleSelectedDateChange(australiaDate);
      handleComparedDateChange("");

    }
    // else if (dateType === "Quarterly") {
    //   handleSelectedDateChange(australiaDate);
    // }
    else if (dateType === "Yearly") {
      handleSelectedDateChange(australiaDate);
      handleComparedDateChange("");

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
          fselected: selectedDate,
          tselected: tselectedDate, // 你可以根据需要修改这个值
          fcompared: comparedDate,
          tcompared: tcomparedDate // 你可以根据需要修改这个值
        };
        const response = await axios.get(process.env.REACT_APP_SERVER_URL + '/searchSalesSummary', {
          ...config,
          params,
          withCredentials: true
        });

        if (!response.data.isAdmin) {
          console.log(response.data.results);
          setDashboard_data(response.data.results);
          
          // setUser(response.data.username);
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
  

else if (!getIsLoading() && !getIsAdmin() && getDashboard_data() ) {

  let selectedTotalNetSales = 0;
  let comparedTotalNetSales = 0;
   // 转换为数组并返回
  const selecteddatesList = [];
  const selectedtotalNetSalesList = [];  
  const compareddatesList = [];
  const comparedtotalNetSalesList = [];
  try{
    if (Array.isArray(getDashboard_data())) {
    getDashboard_data().forEach(dashboardData => {
      Object.entries(dashboardData).forEach(([dateRange, data]) => {
        if (Array.isArray(data)) {
        const [startDate, endDate] = dateRange.split(' - ');
  
        // 对比日期并获取相应数据
        if (startDate === formatDate(selectedDate) && endDate === formatDate(tselectedDate)) {
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

          for (const [SalesDate, sales] of totalNetSalesMap.entries()) {
            selecteddatesList.push(SalesDate);
            selectedtotalNetSalesList.push(sales);
          }
        };
        if (startDate === formatDate(comparedDate) && endDate === formatDate(tcomparedDate)) {
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

          for (const [SalesDate, sales] of totalNetSalesMap.entries()) {
            compareddatesList.push(SalesDate);
            comparedtotalNetSalesList.push(sales);
          }
        }}
      });
    });

  }}
  catch (error) {
    console.log(error);
    navigate('/checkStores');
  }
  

  return (
    <div className="container">
      <Sidebar user={getUser()} onLogout={handleLogout} isOpen={isSidebarOpen} />
      <main>
        <div className="analyze-table">
          <h1>Sales Summary</h1>
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
          <table>
          <thead>
          <tr>
            <th></th>
            <th>
              {
              isCurrentDate ? 
              `Current Date: ${moment(selectedDate, 'YYYY-MM-DD').format('DD-MM-YYYY')}` : 
              (selectedDate === tselectedDate ? 
              `Selected Date: ${moment(selectedDate, 'YYYY-MM-DD').format('DD-MM-YYYY')}` : 
              `Selected Date Range: ${moment(selectedDate, 'YYYY-MM-DD').format('DD-MM-YYYY')} to ${moment(tselectedDate, 'YYYY-MM-DD').format('DD-MM-YYYY')}`)
            }
          </th>
          {
            (comparedDate && tcomparedDate ) && (
              <th>
                {
                  comparedDate === tcomparedDate ? 
                  `Compared Date: ${moment(comparedDate, 'YYYY-MM-DD').format('DD-MM-YYYY')}` : 
                  `Compared Date Range: ${moment(comparedDate, 'YYYY-MM-DD').format('DD-MM-YYYY')} to ${moment(tcomparedDate, 'YYYY-MM-DD').format('DD-MM-YYYY')}`
                }
              </th>
            )
          }

          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="left-align">Total Net Sales</td>
            <td>{typeof selectedTotalNetSales === 'number' ? selectedTotalNetSales.toLocaleString() : selectedTotalNetSales || 0}</td>
            {
              (comparedDate && tcomparedDate ) ? 
              <td>{typeof comparedTotalNetSales === 'number' ? comparedTotalNetSales.toLocaleString() : comparedTotalNetSales|| 0}</td> : null
            }
          </tr>
        </tbody>
          </table>
        </div> 
      </main>
    </div>
  );
}

};

export default SalesSummary;