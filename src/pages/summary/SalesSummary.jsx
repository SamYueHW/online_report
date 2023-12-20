import axios from 'axios';
import React, { useState, useEffect } from 'react';
// import "./dashboardnew.scss";
import Sidebar from '../../components/sidebar/Sidebarnew';
import { useNavigate } from 'react-router-dom';
import useGetState from '../../hooks/useGetState';
import moment from 'moment-timezone';
import { CircularProgress } from '@mui/material';

import Dropdown from '../../components/dropdown/Dropdown';
import DateRangePickerComponent from '../../components/datepicker/DateRangepicker';
import DatePickerComponent from '../../components/datepicker/Datepicker';
import WeekDatePickerComponent from '../../components/datepicker/WeekDatepicker';
import Mchart from '../../components/mchart/Mchart';
import PeakLineChart from '../../components/linechart/PeakLineChart';
import "./SalesSummary.scss";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek'; 



import { set } from 'date-fns';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek); // 使用 isoWeek 插件


const SalesSummary = () => {

 

  const [user, setUser, getUser] = useGetState(null);
  const [isUserFetched, setIsUserFetched, getIsUserFetched] = useGetState(false);
  const [isAdmin, setIsAdmin, getIsAdmin] = useGetState(false);

  const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
  const [dashboard_data, setDashboard_data, getDashboard_data] = useGetState(null);
  const [NetSalesByDate, setNetSalesByDate] = useState({xAxisData1: [],yAxisData1: [],xAxisData2: [],yAxisData2: [],});
  const [PeakLineChartData, setPeakLineChartData] = useState([[],[]]);

  const navigate = useNavigate();

  const [selectedTotalNetSales, setSelectedTotalNetSales] = useState(0);
  const [comparedTotalNetSales, setComparedTotalNetSales] = useState(0);

  const [selectedTotalNetSalesDateRange, setSelectedTotalNetSalesDateRange] = useState(null);
  const [comparedTotalNetSalesDateRange, setComparedTotalNetSalesDateRange] = useState(null);

  const [hasBranch, setHasBranch] = useState(false);
  const [posVersion, setPosVersion] = useState(null);
  const [storeName, setStoreName] = useState(null);
  const [lastestUpdate, setLastestUpdate] = useState(null);
  const [hourlyRangeData, setHourlyRangeData] = useState(null);
  
    // 设置澳大利亚悉尼时区的当前日期
  const australiaDate = dayjs.tz(dayjs(), 'Australia/Sydney').format('DD/MM/YYYY');
  const dateOptions = ["Hourly","Daily", "Weekly", "Monthly","Custom"];

  const [dateType, setDateType] = useState("Hourly");
  
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

// const australiaMoment = moment.tz('Australia/Sydney'); // 获取澳大利亚悉尼时区的当前日期和时间

// // 设置这一周的周一和周日

// const thisMonday = australiaMoment.clone().startOf('isoWeek').format('YYYY-MM-DD');
// const thisSunday = australiaMoment.clone().endOf('isoWeek').format('YYYY-MM-DD');

// // 设置上一周的周一和周日
// const lastMonday = australiaMoment.clone().subtract(1, 'weeks').startOf('isoWeek').format('YYYY-MM-DD');
// const lastSunday = australiaMoment.clone().subtract(1, 'weeks').endOf('isoWeek').format('YYYY-MM-DD');



const [selectedDate, setSelectedDate] = useState(australiaDate);
const [tselectedDate, setTSelectedDate] = useState(australiaDate);
// const [comparedDate, setComparedDate] = useState(lastMonday);

// const [tcomparedDate, setTComparedDate] = useState(lastSunday);
const [comparedDate, setComparedDate] = useState(australiaDate);
const [tcomparedDate, setTComparedDate] = useState(australiaDate);



  // 判断 selectedDate 是否与当前日期相匹配
  const isCurrentDate = selectedDate === australiaDate && tselectedDate === australiaDate;

  const formatDate = (dateString) => {
    return moment(new Date(dateString)).format('YYYY-MM-DD');
  };
  const formatDate2 = (dateString) => {
    return moment(new Date(dateString)).format('DD/MM/YYYY');
  };

  

  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 1570);
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth > 1570);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const processHourlyData = (hourlyData) => {
    
    let seriesData1 = [];
    let seriesData2 = [];
  
    // 创建一个基础数组，包含从0点到23点的数据
    const baseHours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      amount: 0,
      transaction: 0
    }));
  
    if (Array.isArray(hourlyData)) {
      hourlyData.forEach(dashboardData => {
        Object.entries(dashboardData).forEach(([dateRange, data]) => {
          if (Array.isArray(data) && data.length > 0) {
            const [startDate, endDate] = dateRange.split(' - ');
  
            // 对比日期并获取相应数据
            if (startDate === formatDate(selectedDate) && endDate === formatDate(tselectedDate)) {
              seriesData1 = [...baseHours]; // 初始化为基础小时
              data.forEach(record => {
                seriesData1[record.SalesHour] = {
                  hour: record.SalesHour,
                  amount: record.Amount,
                  transaction: record.Transaction
                };
              });
            }
            if (startDate === formatDate(comparedDate) && endDate === formatDate(tcomparedDate)) {
              seriesData2 = [...baseHours]; // 初始化为基础小时
              data.forEach(record => {
                seriesData2[record.SalesHour] = {
                  hour: record.SalesHour,
                  amount: record.Amount,
                  transaction: record.Transaction
                };
              });
            }
          }
        });
      });
    }
    let Data1Date;
    let Data2Date;
    if(selectedDate === australiaDate){
       Data1Date = "Today";
    }else{
      
        Data1Date = formatDate2(selectedDate);
    }
    //if compare date equal to yesterday

    if(comparedDate === dayjs(australiaDate).subtract(1, 'days').format('YYYY-MM-DD')){
        Data2Date = "Yesterday";
    }else{
        Data2Date = formatDate2(comparedDate);
    }
    // console.log(Data1Date);
    setPeakLineChartData([seriesData1, seriesData2,[Data1Date,Data2Date]]);
    
  };
  
    
const processDashboardData = (dashboardData) => {
  let selectedTotalNetSales = 0;
  let comparedTotalNetSales = 0;
  console.log(dashboardData);

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
        console.log(startDate);
        console.log(endDate);
        console.log(formatDate(selectedDate));
        console.log(formatDate(tselectedDate));
        
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
          const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          if (dateType==="Daily"){
            let i = 0; // 初始化一个索引来跟踪当前的星期天
            for (const [SalesDate, sales] of totalNetSalesMap.entries()) {
              
              const dateParts = SalesDate.split('/');
              const formattedDate = `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;
               
              const weekDay = weekDays[i];
              // 在 x1Data 中加入日期和星期缩写
              x1Data.push(`${formattedDate} (${weekDay})`);

              // x1Data.push(formattedDate); // 使用格式化后的日期
              y1Data.push(parseFloat(sales.toFixed(2)));
              i++;
            }
          }
          else if (dateType === "Weekly") {
            const weeklySales = new Map();
            let weekCount = 1;
          
            let currentWeekTotal = 0;
            let dayCount = 0;
            let startDateOfWeek = null;
            let endDateOfWeek = null;
          
            for (const [SalesDate, sales] of totalNetSalesMap.entries()) {
              if (dayCount === 0) {
                startDateOfWeek = SalesDate;  // 记录每周的开始日期
              }
              currentWeekTotal += sales;
              dayCount++;
              endDateOfWeek = SalesDate;  // 更新每周的结束日期
          
              if (dayCount === 7) {
                const weekLabel = `${startDateOfWeek} - ${endDateOfWeek} (Week ${weekCount})`;
                weeklySales.set(weekLabel, currentWeekTotal);
          
                currentWeekTotal = 0;
                dayCount = 0;
                weekCount++;
              }
            }
          
            if (dayCount > 0) {
              const weekLabel = `${startDateOfWeek} - ${endDateOfWeek} (Week ${weekCount})`;
              weeklySales.set(weekLabel, currentWeekTotal);
            }
          
            for (const [weekLabel, sales] of weeklySales.entries()) {
              x1Data.push(weekLabel);
              y1Data.push(parseFloat(sales.toFixed(2)));
              console.log(x1Data);
            }
          }
          
          

          else if (dateType === "Monthly") {
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
            console.log(x1Data);
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

      
          const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          if (dateType==="Daily"){
            let i = 0; // 初始化一个索引来跟踪当前的星期天
            for (const [SalesDate, sales] of totalNetSalesMap.entries()) {
              
                const dateParts = SalesDate.split('/');
                const formattedDate = `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;
                
                const weekDay = weekDays[i];
              // 在 x1Data 中加入日期和星期缩写
                x2Data.push(`${formattedDate} (${weekDay})`);
                y2Data.push(parseFloat(sales.toFixed(2)));
                i++;
            }
            }
            else if (dateType === "Weekly") {
              const weeklySales = new Map();
              let weekCount = 1;
            
              let currentWeekTotal = 0;
              let dayCount = 0;
              let startDateOfWeek = null;
              let endDateOfWeek = null;
            
              for (const [SalesDate, sales] of totalNetSalesMap.entries()) {
                if (dayCount === 0) {
                  startDateOfWeek = SalesDate;  // 记录每周的开始日期
                }
                currentWeekTotal += sales;
                dayCount++;
                endDateOfWeek = SalesDate;  // 更新每周的结束日期
            
                if (dayCount === 7) {
                  const weekLabel = `${startDateOfWeek} - ${endDateOfWeek} (Week ${weekCount})`;
                  weeklySales.set(weekLabel, currentWeekTotal);
            
                  currentWeekTotal = 0;
                  dayCount = 0;
                  weekCount++;
                }
              }
            
              if (dayCount > 0) {
                const weekLabel = `${startDateOfWeek} - ${endDateOfWeek} (Week ${weekCount})`;
                weeklySales.set(weekLabel, currentWeekTotal);
              }
            
              for (const [weekLabel, sales] of weeklySales.entries()) {
                x2Data.push(weekLabel);
                y2Data.push(parseFloat(sales.toFixed(2)));
              }
              
            }
            
          else if (dateType === "Monthly") {
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
    
    setNetSalesByDate({xAxisData1: x1Data, yAxisData1: y1Data, xAxisData2: x2Data, yAxisData2: y2Data,});

  }}
  catch (error) {
    console.log(error);
    //navigate('/');
  }
}
const handleSelectedDatePickerChange = (dates, dateStrings) => {
  // dateStrings 是日期范围的字符串数组，形如 ["YYYY-MM-DD", "YYYY-MM-DD"]
  // 更新您的状态或执行其他逻辑

  if(dateType !== "Hourly"){

    setSelectedDate(dateStrings[0]);
    setTSelectedDate(dateStrings[1]);
 
  }
  else{

    setSelectedDate(dateStrings);
    setTSelectedDate(dateStrings);
  }
};
const handleComparedDatePickerChange = (dates, dateStrings) => {
  // dateStrings 是日期范围的字符串数组，形如 ["YYYY-MM-DD", "YYYY-MM-DD"]
  // 更新您的状态或执行其他逻辑
 
  if(dateType !== "Hourly"){
    // if (dateStrings[0] === '' || dateStrings[1] === '') {
    //   setSelectedDate(australiaDate);
    //   setTSelectedDate(australiaDate);
    // }else{

    setComparedDate(dateStrings[0]);
    setTComparedDate(dateStrings[1]);
  // }
  }
  else{ 
    setComparedDate(dateStrings);
    setTComparedDate(dateStrings);
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
    
    if (comparedDate && tcomparedDate && new Date(comparedDate) > new Date(tcomparedDate)) {
      alert("Please enter a valid date range for Compared Dates.");
      return;
    }
// 构造请求参数
const fselected = dayjs(selectedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
const tselected = dayjs(tselectedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');



const fcompared = comparedDate !== "Invalid Date" ? dayjs(comparedDate, 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
        const tcompared = tcomparedDate !== "Invalid Date" ? dayjs(tcomparedDate, 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
// console.log(fselected);
// console.log(tselected);
// console.log(fcompared);
// console.log(tcompared);
    const params = {
      fselected: fselected,
      tselected: tselected, // 你可以根据需要修改这个值
      fcompared: fcompared,
      tcompared: tcompared, // 你可以根据需要修改这个值
      dateType: dateType
    }
    console.log(params);
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
        
        processHourlyData(response.data.hourlyResult);
        if(response.data.hourlyResult){
        const dateRanges = response.data.hourlyResult.map((item) => {
          const key = Object.keys(item)[0];
          const [startDate, endDate] = key.split(' - ');
          return { startDate, endDate };
        });
        
        setHourlyRangeData(dateRanges);
      }
        
        
        // setUser(response.data.username);
        setIsAdmin(response.data.isAdmin);
        setIsUserFetched(true);
        
      }
    } catch (error) {
      //navigate('/');
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
    const parsedDate = dayjs(selectedDate, 'DD/MM/YYYY');
     if (dateType === "Hourly") {
      setSelectedDate(selectedDate);
      setTSelectedDate(selectedDate);
    }
    else if (dateType === "Daily") {
      
      console.log(parsedDate);
      const startOfWeek = parsedDate.startOf('isoWeek').format('DD/MM/YYYY');
      const endOfWeek = parsedDate.endOf('isoWeek').format('DD/MM/YYYY');
      console.log(startOfWeek);
      console.log(endOfWeek);

      setSelectedDate(startOfWeek);
      setTSelectedDate(endOfWeek);
    } 
    else if (dateType === "Weekly") {
      
      const endOfWeek = parsedDate.endOf('isoWeek');
      const fourWeeksAgo = parsedDate.subtract(3, 'weeks').startOf('isoWeek');
      
      // const fourWeeksAgo = dayjs(endOfWeek).subtract(3, 'weeks').startOf('isoWeek');
    
      setSelectedDate(fourWeeksAgo);
      setTSelectedDate(endOfWeek);
    }
    

    else if (dateType === "Monthly") {
      const startOfYear = dayjs(selectedDate).startOf('year');
      const endOfYear = dayjs(selectedDate).endOf('year');
      setSelectedDate(startOfYear);
      setTSelectedDate(endOfYear);
    }
    else if (dateType === "Custom") {
      setSelectedDate(selectedDate);
      setTSelectedDate(selectedDate);

     
    }
  };
  
  function formatDateTime(isoString) {
    const date = new Date(isoString);

    // 墨尔本时区的偏移（以小时为单位），根据需要调整为 UTC+10 或 UTC+11
    const melbourneOffset = 11; // 或者在夏令时期间改为 11

    // 将 UTC 时间转换为墨尔本时间
    const utcDate = date.getTime() + date.getTimezoneOffset() * 60000; // 转换为 UTC
    const melbourneDate = new Date(utcDate + melbourneOffset * 3600000); // 应用墨尔本的偏移

    const day = String(melbourneDate.getDate()).padStart(2, '0');
    const month = String(melbourneDate.getMonth() + 1).padStart(2, '0');
    const year = melbourneDate.getFullYear();

    let hours = melbourneDate.getHours();
    const minutes = String(melbourneDate.getMinutes()).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 如果小时为0，则转换为12

    return `${day}/${month}/${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}


  const handleComparedDateChange = (selectedDate) => {

    let comparedStartDate = "";
    let comparedEndDate = "";

  

    if (dateType === "Hourly") {
      comparedStartDate = dayjs(selectedDate).subtract(0, 'days');

      comparedEndDate = comparedStartDate;
    }

    else if (dateType === "Daily") {
      comparedStartDate = dayjs(selectedDate).subtract(0, 'weeks').startOf('isoWeek');
      comparedEndDate = dayjs(selectedDate).subtract(0, 'weeks').endOf('isoWeek');

    } 
    else if (dateType === "Weekly") {
      // 获取selectedDate所在周的周一作为一周的开始
       
      const endOfWeek = dayjs(selectedDate).endOf('isoWeek');
      
      const fourWeeksAgo = dayjs(endOfWeek).subtract(3, 'weeks').startOf('isoWeek');
    
      comparedStartDate = fourWeeksAgo;
      comparedEndDate = endOfWeek;
    }
    
    else if (dateType === "Monthly") {
      comparedStartDate = dayjs(selectedDate).subtract(0, 'years').startOf('year');
      comparedEndDate = dayjs(selectedDate).subtract(0, 'years').endOf('year');
    }
    setComparedDate(comparedStartDate);
    setTComparedDate(comparedEndDate);
  };


  
  useEffect(() => {
    // 这里是初始化日期的逻辑
    processDashboardData([]);
    // setComparedDate(null);
    //   setTComparedDate(null);
    
    
    // 根据 dateType 来初始化日期
    // if (dateType === "Daily") {
    //   handleSelectedDateChange(australiaDate);
    //   handleComparedDateChange();
    // } 
    if (dateType === "Hourly") {
      handleSelectedDateChange(australiaDate);
      handleComparedDateChange(null);
     
      
    }
    else if (dateType === "Daily") {
      handleSelectedDateChange(australiaDate);
      handleComparedDateChange(null);

    } 
    else if (dateType === "Weekly") {
      handleSelectedDateChange(australiaDate);
      handleComparedDateChange(null);
    }

    else if (dateType === "Monthly") {
      handleSelectedDateChange(australiaDate);
      
      handleComparedDateChange(null);
    }
    else if (dateType === "Custom") {
      handleSelectedDateChange(australiaDate);
      handleComparedDateChange(null);
     

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
        
        const fselected = dayjs(selectedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
        const tselected = dayjs(tselectedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
        const fcompared = comparedDate !== "Invalid Date" ? dayjs(comparedDate, 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
        const tcompared = tcomparedDate !== "Invalid Date" ? dayjs(tcomparedDate, 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
        const params = {
          fselected: fselected,
          tselected: tselected, // 你可以根据需要修改这个值
          
          fcompared: fcompared,
          tcompared: tcompared, // 你可以根据需要修改这个值
          dateType: dateType
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

          setPosVersion(response.data.posVersion['PosVersion']);
          setIsAdmin(response.data.isAdmin);
          setIsUserFetched(true);
          
          processHourlyData(response.data.hourlyResult);
          const dateRanges = response.data.hourlyResult.map((item) => {
            const key = Object.keys(item)[0];
            const [startDate, endDate] = key.split(' - ');
            return { startDate, endDate };
          });
          setHourlyRangeData(dateRanges);
       
          
          setUser(response.data.ClientNameResult);
          
          setStoreName(response.data.StoreName);
          setLastestUpdate(formatDateTime(response.data.LastestReportUpdateTimeResult));
          
        } else {
          setIsLoading(false);
          setIsAdmin(response.data.isAdmin);
          setIsUserFetched(true);
          setDashboard_data(response.data.data);
        }
      } catch (error) {
        //navigate('/');
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

  else if (!getIsLoading() && !getIsAdmin() && getDashboard_data()) { 
    // console.log(NetSalesByDate.xAxisData1[2])
    let daysOrHours = [];

    if (dateType === 'Daily') {
      daysOrHours = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else if (dateType === 'Hourly') {
      daysOrHours = Array.from({ length: 24 }, (_, i) => {
        const hour = i % 12 === 0 ? 12 : i % 12;
        const period = i < 12 ? ' AM' : ' PM';
        return `${hour}${period}`;
      });
    }
     else if (dateType === 'Weekly') {
      daysOrHours = Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
    }else if (dateType === 'Monthly') {
      daysOrHours = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sep','Oct','Nov','Dec'];
    }

    function removeLastParenthesis(str) {
      const index = str.lastIndexOf('(');
      return index !== -1 ? str.substring(0, index).trim() : str;
    }
    
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
              <p>Hey, <b>{getUser()}</b> [{storeName}]</p>
              <small className='text-muted'>Last Updates: {lastestUpdate}</small>
            </div>  
            <div className='profile-photo'>
              <img src='./images/enrichIcon.jpg' />
            </div>
          </div>
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
          {dateType !== "Custom"&&<div className="date">
            <h2>Selected Date</h2>
            
            {dateType==="Hourly"&&(      <DatePickerComponent 
            value={selectedDate}
            onChange={handleSelectedDatePickerChange}
            />)}
            {dateType==="Daily"&&(
              <WeekDatePickerComponent
              value={selectedDate}
              onChange={handleSelectedDatePickerChange}
              
            />)}
            {dateType==="Custom"&&(
                    <DateRangePickerComponent 
                    value={[selectedDate, tselectedDate]}
                    onChange={handleSelectedDatePickerChange}
                    />
            )}

          </div>}
          {dateType !== "Monthly"&& (
            <div className="date">
              <h2>Compared Date</h2>
             
              {dateType !== "Hourly" ? (
                <DateRangePickerComponent 
                value={[comparedDate, tcomparedDate]}
                onChange={handleComparedDatePickerChange}
                />
              ):(  <DatePickerComponent 
                value={comparedDate}
                onChange={handleComparedDatePickerChange}
                />)}
            </div>
          )}
          


          <button className="ripple" onClick={handleSearch}>Search</button>
          <div className='daily-report'>
          <table className='sales-summary-table'>
  <thead>
    <tr>
      <th></th>
      <th>
        {
          isCurrentDate ? 
          <>
            Today: <br />
            {selectedDate}
          </> : 
          (selectedDate === tselectedDate ? 
          <>
            Selected Date: <br />
            {selectedDate}
          </> : 
          <>
            Selected Date Range: <br />
            {selectedDate} to {tselectedDate}
          </>)
        }
      </th>
      {
         (comparedDate && dayjs(comparedDate).isValid() &&
         tcomparedDate && dayjs(tcomparedDate).isValid() && 
         (
           // 检查comparedTotalNetSalesDateRange是否存在并匹配日期范围
           (comparedTotalNetSalesDateRange && 
            comparedTotalNetSalesDateRange.startDate === formatDate(comparedDate) &&
            comparedTotalNetSalesDateRange.endDate === formatDate(tcomparedDate)
           ) ||
           // 检查hourlyRangeData是否存在并匹配日期范围
           (hourlyRangeData[1] && 
            hourlyRangeData[1].startDate === comparedDate &&
            hourlyRangeData[1].endDate === tcomparedDate)
         )
        )  && (
          <th>
            {
              comparedDate === tcomparedDate ? 
              <>
                Compared Date: <br />
                {comparedDate}
              </> : 
              <>
                Compared Date Range: <br />
                {comparedDate} to {tcomparedDate}
              </>
            }
          </th>
        )      }
    </tr>
  </thead>
  <tbody>
  {daysOrHours.map((dayOrHour, index) => {
  // 为 selectedDate 和 comparedDate 获取数据
  const selectedAmount = dateType === "Hourly"
    ? PeakLineChartData[0][index]?.amount
    : NetSalesByDate.yAxisData1[index];

  const comparedAmount = dateType === "Hourly"
    ? PeakLineChartData[1][index]?.amount
    : NetSalesByDate.yAxisData2[index];
    <td>
      {selectedTotalNetSalesDateRange &&
      selectedTotalNetSalesDateRange.startDate === formatDate(selectedDate) &&
      selectedTotalNetSalesDateRange.endDate === formatDate(tselectedDate)
        ? selectedAmount != null
          ? dateType === 'Weekly'
            ? <span>{selectedAmount.toLocaleString()} <span style={{fontSize: '10px'}}><br />({removeLastParenthesis(NetSalesByDate.xAxisData1[index])})</span></span>
            : selectedAmount.toLocaleString()
          : "-"
        : "-"}
    </td>
    
  // 如果 selectedAmount 和 comparedAmount 同时为 0 或者不存在，则不渲染该行
  if ((selectedAmount === 0 || selectedAmount == null) && (comparedAmount === 0 || comparedAmount == null)) {
    return null;
  }

  return (
    <tr key={dayOrHour}>
      <td>{dayOrHour}</td>
      <td>
  {selectedTotalNetSalesDateRange &&
  selectedTotalNetSalesDateRange.startDate === formatDate(selectedDate) &&
  selectedTotalNetSalesDateRange.endDate === formatDate(tselectedDate)
    ? selectedAmount != null
      ? dateType === 'Weekly'
        ? <span>{selectedAmount.toLocaleString()} <span style={{fontSize: '10px'}}><br />({removeLastParenthesis(NetSalesByDate.xAxisData1[index])})</span></span>
        : selectedAmount.toLocaleString()
      : "-"
    : "-"}
</td>
<td>
  {comparedDate && tcomparedDate && comparedAmount !== null
    ? comparedTotalNetSalesDateRange &&
      comparedTotalNetSalesDateRange.startDate === formatDate(comparedDate) &&
      comparedTotalNetSalesDateRange.endDate === formatDate(tcomparedDate)
      ? (
        <span>
          {comparedAmount !== 0
            ? (
              <span>
                {comparedAmount.toLocaleString()}{" "}
                {dateType === 'Weekly'
                  ? (
                    <span style={{ fontSize: '10px' }}>
                      <br />({removeLastParenthesis(NetSalesByDate.xAxisData2[index])})
                    </span>
                  )
                  : null // Don't execute removeLastParenthesis for non-Weekly dateType
                }
              </span>
            )
            : (
              <span>
                0{" "}
                {dateType === 'Weekly'
                  ? (
                    <span style={{ fontSize: '10px' }}>
                      <br />({removeLastParenthesis(NetSalesByDate.xAxisData2[index])})
                    </span>
                  )
                  : null // Don't execute removeLastParenthesis for non-Weekly dateType
                }
              </span>
            )
          }
        </span>
      )
      : ""
    : "-"}
</td>



    </tr>
  );
})}

    <tr>
      <td>Total Net Sales</td>
      <td>
        {(selectedTotalNetSalesDateRange &&
          selectedTotalNetSalesDateRange.startDate === formatDate(selectedDate) &&
          selectedTotalNetSalesDateRange.endDate === formatDate(tselectedDate) &&
          typeof selectedTotalNetSales === 'number') 
          ? selectedTotalNetSales.toLocaleString() : '-'}
      </td>
      {comparedDate && tcomparedDate && comparedTotalNetSalesDateRange &&   (
        <td>
          {(comparedTotalNetSalesDateRange &&
            comparedTotalNetSalesDateRange.startDate === formatDate(comparedDate) &&
            comparedTotalNetSalesDateRange.endDate === formatDate(tcomparedDate) &&
            typeof comparedTotalNetSales === 'number') 
            ? comparedTotalNetSales.toLocaleString() : ''}
        </td>
      )}
    </tr>
  </tbody>
</table>

          </div>
          
        </div> 
      </div>
      <div className='right-column'>
      <div className='right'>
            <div className='rank'>
          {
            dateType !== "Hourly"?
            (
              <>
                <h2>Sales Summary Chart</h2>
                <div className='chart'style={{ marginBottom: '100px' }} >
                  <Mchart dateType={dateType} data={NetSalesByDate} />
                </div>
              </>
            )
            : (
              dateType === "Hourly" && PeakLineChartData  ? (
                <>
                  <h2>Hourly Sales Chart</h2>
                  <div className='chart' style={{ marginBottom: '100px' }}>
                    <PeakLineChart data={PeakLineChartData}  />
                  </div>
                </>
              ) : null
            )
          }
            </div>
          </div>
          </div>
          </main>
          </div>
      </div>
    </div>
  );
}


};

export default SalesSummary;