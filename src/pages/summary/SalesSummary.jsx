import axios from 'axios';
import React, { useState, useEffect } from 'react';
// import "./dashboardnew.scss";
import Sidebar from '../../components/sidebar/Sidebarnew';
import { useNavigate } from 'react-router-dom';
import useGetState from '../../hooks/useGetState';
import moment from 'moment-timezone';
import { CircularProgress } from '@mui/material';

import CustomSwitch  from '../../components/switch/Switch';
import CustomBarChart from '../../components/barchart/CustomBarChart';
import Dropdown from '../../components/dropdown/Dropdown';
import DropdownAntModule from '../../components/dropdown/DropdownAntModule';
import DropdownCalendar from '../../components/dropdown/DropdownCalendar';
import DateRangePickerComponent from '../../components/datepicker/DateRangepicker';
// import DatePickerComponent from '../../components/datepicker/Datepicker';
// import WeekDatePickerComponent from '../../components/datepicker/WeekDatepicker';
import Mchart from '../../components/mchart/Mchart';
import PeakLineChart from '../../components/linechart/PeakLineChart';
import DayLineChart from '../../components/linechart/DayLineChart';
import HourlyForDaysChart from '../../components/linechart/HourlyForDays';
import "./SalesSummary.scss";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek'; 
import { parseISO, addDays,isWithinInterval } from 'date-fns';


import { set } from 'date-fns';
import { da, is } from 'date-fns/locale';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek); // 使用 isoWeek 插件


const SalesSummary = () => {
  // const options = [{ key: 'day', label: 'Hourly' },{ key: 'Daily', label: 'Daily' },{ key: 'Weekly', label: 'Weekly' }];
  const [dropdownOptions, setDropdownOptions] = useState(null);
  const [dropdownDefaultSelected, setDropdownDefaultSelected] = useState(null);
  const [dateType, setDateType] = useState('vs previous day');
  const [searchedDateType, setSearchedDateType] = useState('');
 

  const [user, setUser, getUser] = useGetState(null);
  const [isUserFetched, setIsUserFetched, getIsUserFetched] = useGetState(false);
  const [isAdmin, setIsAdmin, getIsAdmin] = useGetState(false);

  const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
  const [dashboard_data, setDashboard_data, getDashboard_data] = useGetState(null);
  const [NetSalesByDate, setNetSalesByDate] = useState({xAxisData1: [],yAxisData1: [],xAxisData2: [],yAxisData2: [],});
  const [PeakLineChartData, setPeakLineChartData] = useState([[],[]]);

  const [weeklyChartData, setWeeklyChartData] = useState(null);
  const [hourlyChartDataForDays, setHourlyChartDataForDays] = useState(null);

  const navigate = useNavigate();

  const [selectedTotalNetSales, setSelectedTotalNetSales] = useState(0);
  const [comparedTotalNetSales, setComparedTotalNetSales] = useState(0);
  const [percentageDifference, setPercentageDifference] = useState(null);
  const [arrowSymbol, setArrowSymbol] = useState('↑');
  const [colorStyle, setColorStyle] = useState({ color: '#28a745' });
  const [chartType, setChartType] = useState('day');  
  const [xAxisData, setXAxisData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);

  const [selectedTotalNetSalesDateRange, setSelectedTotalNetSalesDateRange] = useState(null);
  const [comparedTotalNetSalesDateRange, setComparedTotalNetSalesDateRange] = useState(null);

  const [hasBranch, setHasBranch] = useState(false);
  const [posVersion, setPosVersion] = useState(null);
  const [storeName, setStoreName] = useState(null);
  const [lastestUpdate, setLastestUpdate] = useState(null);
  const [hourlyRangeData, setHourlyRangeData] = useState(null);
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
    // 设置澳大利亚悉尼时区的当前日期
  const australiaDate = dayjs.tz(dayjs(), 'Australia/Sydney').format('DD/MM/YYYY');
  const yesterday = dayjs(australiaDate).subtract(1, 'days').format('DD/MM/YYYY');

  const handleDropdownSelect = (key) => {
    setChartType(key);
    setDropdownDefaultSelected(key);
  };

 
  
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

const [comparedDate, setComparedDate,getComparedDate] = useGetState(yesterday);
const [tcomparedDate, setTComparedDate,getTComparedDate] = useGetState(yesterday);



  // 判断 selectedDate 是否与当前日期相匹配
  const isCurrentDate = selectedDate === australiaDate && tselectedDate === australiaDate;

  const formatDate = (dateString) => {
   
    return dayjs(dateString, 'DD/MM/YYYY').format('YYYY-MM-DD');
  };
  const formatDate2 = (dateString) => {
    return dayjs(dateString, 'YYYY-MM-DD').format('DD/MM/YYYY');
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
  const processHourlyDataForDays = (data) => {
    const results = [];
    data.forEach(group => {
      const key = Object.keys(group)[0]; // 获取时间段的 key
      const records = group[key];
      const hourlyData = { hours: [], amounts: [], legend: key };
  
      if (Array.isArray(records)) {
        records.forEach(record => {
          const { SalesHour, Amount } = record;
          const hourIndex = hourlyData.hours.indexOf(SalesHour);
  
          if (hourIndex === -1) {
            hourlyData.hours.push(SalesHour);
            hourlyData.amounts.push(Amount);
          } else {
            hourlyData.amounts[hourIndex] += Amount;
          }
        });
      }
  
      if (hourlyData.hours.length > 0) {
        results.push(hourlyData);
      }
    });
  console.log(results);

    setHourlyChartDataForDays(results);
  };
  
  
  

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
           
            if (startDate === getComparedDate() && endDate === getTComparedDate()) {
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
      
        Data1Date = selectedDate;
    }
    //if compare date equal to yesterday

    if(getComparedDate() === dayjs(australiaDate).subtract(1, 'days').format('YYYY-MM-DD')){
        Data2Date = "Yesterday";
    }else{
        Data2Date = formatDate2(getComparedDate());
    }
    // console.log(Data1Date);
    setPeakLineChartData([seriesData1, seriesData2,[Data1Date,Data2Date]]);
    
  };
  

    
const processDashboardData = (dashboardData, searchedDateType) => {

  let selectedTotalNetSales = 0;
  let comparedTotalNetSales = 0;
  let xAxisData = [];
  let seriesData = [];  

  let x1Data = [];
  let y1Data = [];
  let x2Data = [];
  let y2Data = [];
  try{
    if (Array.isArray(dashboardData)) {
    let isFirstElement = true; //跟踪是否是第一个元素

    dashboardData.forEach(dashboardData => {
      Object.entries(dashboardData).forEach(([dateRange, data]) => {
        if (Array.isArray(data)) {
         
          
          const [startDate, endDate] = dateRange.split(' - ');
          const isWeek = (dayjs(endDate).diff(dayjs(startDate), 'day') + 1) >= 14;
          if (isFirstElement) {
          if (isWeek) {
       
          
            let parsedStartDate = dayjs(startDate);
            let parsedEndDate = dayjs(endDate);
          
            let weekSales = [];
            let currentWeekStart = parsedStartDate;
            let currentWeekEnd;
          
            while (currentWeekStart <= parsedEndDate) {
              if (currentWeekStart.isSame(parsedStartDate)) {
                // 第一个周期的结束日期是该周的周日
                currentWeekEnd = parsedStartDate.day() === 0 ? parsedStartDate : parsedStartDate.day(7);
              } else {
                // 中间周期的开始日期是周一，结束日期是周日
                currentWeekStart = currentWeekStart.day() === 1 ? currentWeekStart : currentWeekStart.day(1);
                currentWeekEnd = currentWeekStart.day(7);
              }
          
              // 处理最后一个周期
              if (currentWeekEnd.isAfter(parsedEndDate)) {
                currentWeekEnd = parsedEndDate;
              }
          
              const weeklyTotal = data
                .filter(d => {
                  const date = dayjs(d.Date);
                  return (date.isSame(currentWeekStart) || date.isAfter(currentWeekStart)) && 
                         (date.isSame(currentWeekEnd) || date.isBefore(currentWeekEnd));
                })
                .reduce((total, current) => total + current.TotalNetSales, 0);
          
              weekSales.push({ start: currentWeekStart.toDate(), end: currentWeekEnd.toDate(), total: weeklyTotal.toFixed(2) });
          
              // 移动到下一个周期的开始
              currentWeekStart = currentWeekEnd.add(1, 'day');
            }
            setWeeklyChartData(weekSales);
            isFirstElement = false;
           
          }
        
        }


          
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
            if (searchedDateType==="week"){
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
            else if (searchedDateType === "month") {
           
              xAxisData.push(Array.from(totalNetSalesMap.keys()));
              
              seriesData.push( Array.from(totalNetSalesMap.values()));
              // const weeklySales = new Map();
              // let weekCount = 1;
            
              // let currentWeekTotal = 0;
              // let dayCount = 0;
              // let startDateOfWeek = null;
              // let endDateOfWeek = null;
            
              // for (const [SalesDate, sales] of totalNetSalesMap.entries()) {
              //   if (dayCount === 0) {
              //     startDateOfWeek = SalesDate;  // 记录每周的开始日期
              //   }
              //   currentWeekTotal += sales;
              //   dayCount++;
              //   endDateOfWeek = SalesDate;  // 更新每周的结束日期
            
              //   if (dayCount === 7) {
              //     const weekLabel = `${startDateOfWeek} - ${endDateOfWeek} (Week ${weekCount})`;
              //     weeklySales.set(weekLabel, currentWeekTotal);
            
              //     currentWeekTotal = 0;
              //     dayCount = 0;
              //     weekCount++;
              //   }
              // }
            
              // if (dayCount > 0) {
              //   const weekLabel = `${startDateOfWeek} - ${endDateOfWeek} (Week ${weekCount})`;
              //   weeklySales.set(weekLabel, currentWeekTotal);
              // }
            
              // for (const [weekLabel, sales] of weeklySales.entries()) {
              //   x1Data.push(weekLabel);
              //   y1Data.push(parseFloat(sales.toFixed(2)));
              //   console.log(x1Data);
              // }
            }
            
            

            else  {
              xAxisData.push(Array.from(totalNetSalesMap.keys()));
              
              seriesData.push( Array.from(totalNetSalesMap.values()));
              // const monthlySales = new Map();
              // let year = null;
            
              // for (const [SalesDate, sales] of totalNetSalesMap.entries()) {
              //   const dateObject = new Date(SalesDate);
              //   year = dateObject.getFullYear();  // 获取年份
              //   const month = dateObject.getMonth(); // 获取月份（0 = 一月, 1 = 二月, ...）
            
              //   // 如果这个月份还没有添加到 monthlySales 中，则初始化为0
              //   if (!monthlySales.has(month)) {
              //     monthlySales.set(month, 0);
              //   }
            
              //   // 累加这个月的销售额
              //   monthlySales.set(month, monthlySales.get(month) + sales);
              // }
            
              // const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            
              // // 将每个月的累计销售额添加到 x1Data 和 y1Data 中
              // for (const [month, sales] of monthlySales.entries()) {
              //   x1Data.push(`${monthNames[month]} ${year}`);  // 在这里加上了年份
              //   y1Data.push(parseFloat(sales.toFixed(2)));
              // }
              // console.log(x1Data);
            }

          }
         
          else if (startDate === getComparedDate() && endDate === getTComparedDate()) {

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
            if (searchedDateType==="week"){
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
              else if (searchedDateType === "month") {
                xAxisData.push(Array.from(totalNetSalesMap.keys()));
                
              
                seriesData.push( Array.from(totalNetSalesMap.values()));
               
              }
              
            else  {
              xAxisData.push(Array.from(totalNetSalesMap.keys()));
                
              
                seriesData.push( Array.from(totalNetSalesMap.values()));
              // const monthlySales = new Map();
              // let year = null;
            
              // for (const [SalesDate, sales] of totalNetSalesMap.entries()) {
              //   const dateObject = new Date(SalesDate);
              //   year = dateObject.getFullYear();  // 获取年份
              //   const month = dateObject.getMonth(); // 获取月份（0 = 一月, 1 = 二月, ...）
            
              //   // 如果这个月份还没有添加到 monthlySales 中，则初始化为0
              //   if (!monthlySales.has(month)) {
              //     monthlySales.set(month, 0);
              //   }
            
              //   // 累加这个月的销售额
              //   monthlySales.set(month, monthlySales.get(month) + sales);
              // }
            
              // const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            
              // // 将每个月的累计销售额添加到 x1Data 和 y1Data 中
              // for (const [month, sales] of monthlySales.entries()) {
              //   x2Data.push(`${monthNames[month]} ${year}`);  // 在这里加上了年份
              //   y2Data.push(parseFloat(sales.toFixed(2)));
              // }
            }
            
          }
        }
       
      });
    });

    
    setSelectedTotalNetSales(selectedTotalNetSales.toFixed(2));

    setComparedTotalNetSales(comparedTotalNetSales.toFixed(2));
    let percentageDifferenceResult = 0;
    if(comparedTotalNetSales!== 0){
      percentageDifferenceResult = (((selectedTotalNetSales - comparedTotalNetSales) / comparedTotalNetSales) * 100).toFixed(2);
      if (percentageDifferenceResult > 0) {
        setArrowSymbol('↑');
        setColorStyle({ color: '#28a745' });
      } else if (percentageDifferenceResult < 0) {
        setArrowSymbol('↓');
        setColorStyle({ color: '#dc3545' });
      } 
      
      
      setPercentageDifference(percentageDifferenceResult);
    }
    else{
      setPercentageDifference(0);
      setArrowSymbol('');
      setColorStyle({ color: '#000' });
    }
 

   
    setNetSalesByDate({xAxisData1: x1Data, yAxisData1: y1Data, xAxisData2: x2Data, yAxisData2: y2Data,});
    setXAxisData(xAxisData);
    setSeriesData(seriesData);

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
    
    // if (new Date(selectedDate) > new Date(tselectedDate)) {
    //   alert("Please enter a valid date range for Selected Dates.");
    //   return;
    // }
    


    

    // if (comparedDate && tcomparedDate && new Date(comparedDate) > new Date(tcomparedDate)) {
    //   alert("Please enter a valid date range for Compared Dates.");
    //   return;
    // }
// 构造请求参数
const fselected = dayjs(selectedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
const tselected = dayjs(tselectedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');


let fcompared;
let tcompared;
switch (selectedDateType) {
  case 'day':
    switch(dateType){
      case 'vs Previous day':
        fcompared = dayjs(selectedDate, 'DD/MM/YYYY').subtract(1, 'days').format('YYYY-MM-DD');
        tcompared = dayjs(tselectedDate, 'DD/MM/YYYY').subtract(1, 'days').format('YYYY-MM-DD');

        break;
      case 'vs The same day of last week':
        fcompared = dayjs(selectedDate, 'DD/MM/YYYY').subtract(7, 'days').format('YYYY-MM-DD');
        tcompared = dayjs(tselectedDate, 'DD/MM/YYYY').subtract(7, 'days').format('YYYY-MM-DD');
        break;
      case 'vs The same day of last month':
        fcompared = dayjs(selectedDate, 'DD/MM/YYYY').subtract(1, 'months').format('YYYY-MM-DD');
        tcompared = dayjs(tselectedDate, 'DD/MM/YYYY').subtract(1, 'months').format('YYYY-MM-DD');
        break;
      default:
        break;
    }
    break;
  case 'week':
    switch(dateType){
      case 'vs Previous week':
        fcompared = dayjs(selectedDate, 'DD/MM/YYYY').subtract(1, 'weeks').format('YYYY-MM-DD');
        tcompared = dayjs(tselectedDate, 'DD/MM/YYYY').subtract(1, 'weeks').format('YYYY-MM-DD');
        break;
      case 'vs The same week of last month':
        fcompared = dayjs(selectedDate, 'DD/MM/YYYY').subtract(1, 'months').format('YYYY-MM-DD');
        tcompared = dayjs(tselectedDate, 'DD/MM/YYYY').subtract(1, 'months').format('YYYY-MM-DD');
        break;
      default:
        break;
    }
    setDropdownDefaultSelected('Daily');
    break;
  case 'month':
    // switch(dateType){
    //   case 'vs Previous month':
    //     fcompared = dayjs(selectedDate, 'DD/MM/YYYY').subtract(1, 'months').format('YYYY-MM-DD');
    //     tcompared = dayjs(tselectedDate, 'DD/MM/YYYY').subtract(1, 'months').format('YYYY-MM-DD');
    //     break;
    //   case 'vs The same month of last year':
    //     fcompared = dayjs(selectedDate, 'DD/MM/YYYY').subtract(1, 'years').format('YYYY-MM-DD');
    //     tcompared = dayjs(tselectedDate, 'DD/MM/YYYY').subtract(1, 'years').format('YYYY-MM-DD');
    //     break;
    //   default:
    //     break;
    // }
    setDropdownDefaultSelected('Weekly');
    break;

  default:
    break;
}


  // setSelectedDate(dayjs(fselected, 'DD/MM/YYYY'));
  // setTSelectedDate(dayjs(tselected, 'DD/MM/YYYY'));
  setComparedDate(fcompared);
  setTComparedDate(tcompared);

 
    const params = {
      fselected: fselected,
      tselected: tselected, // 你可以根据需要修改这个值
      fcompared: fcompared,
      tcompared: tcompared, // 你可以根据需要修改这个值
      dateType: selectedDateType
    }
    
    // 发送 GET 请求
    try {
      const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
      const config = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      setWeeklyChartData(null);
      setHourlyChartDataForDays(null);
      setXAxisData([]);
      setSeriesData(null);
      setPeakLineChartData([[],[],[]]);
      setNetSalesByDate({xAxisData1: [],yAxisData1: [],xAxisData2: [],yAxisData2: [],});
      setSearchedDateType(null);
      setChartType(null);

      const response = await axios.get(process.env.REACT_APP_SERVER_URL + '/searchSalesSummary', {
        ...config,
        params,
        withCredentials: true
      });
      // 处理响应结果
      if (response.status === 200) {
       
        setDashboard_data(response.data.results);
        setHasBranch(response.data.hasBranchResult);
        
        processDashboardData(response.data.results, response.data.DateType);

        if(response.data.DateType === "day" && response.data.hourlyResult){
          
          processHourlyData(response.data.hourlyResult);
          if(response.data.hourlyResult){
          const dateRanges = response.data.hourlyResult.map((item) => {
            const key = Object.keys(item)[0];
            const [startDate, endDate] = key.split(' - ');
            return { startDate, endDate };
          });
          
          setHourlyRangeData(dateRanges);
        }}
        else{
          processHourlyDataForDays(response.data.hourlyResult);

        }
      
        setSearchedDateType(response.data.DateType);
      
        
        if (response.data.DateType === "day") {
          setDropdownOptions(null);
         
        } else if (response.data.DateType === "week") {
          setDropdownOptions([{ key: 'Hourly', label: 'Hourly' },{ key: 'Daily', label: 'Daily' }]);
          setDropdownDefaultSelected('Daily');
          setChartType('Daily');
        }
        else if (response.data.DateType === "month") {
          setDropdownOptions([{ key: 'Hourly', label: 'Hourly' },{ key: 'Daily', label: 'Daily' },{ key: 'Weekly', label: 'Weekly' }]);
          setDropdownDefaultSelected('Weekly');
          setChartType('Weekly');
        }
        else if (response.data.DateType === "days") {
          setDropdownOptions([{ key: 'Hourly', label: 'Hourly' },{ key: 'Daily', label: 'Daily' }]);
          setDropdownDefaultSelected('Daily');
          setChartType('Daily');
        }
        else if(response.data.DateType === "weeks"){
          setDropdownOptions([{ key: 'Hourly', label: 'Hourly' },{ key: 'Daily', label: 'Daily' },{ key: 'Weekly', label: 'Weekly' }]);
          setDropdownDefaultSelected('Weekly');
          setChartType('Weekly');
        }
        
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
  function formatCurrency(value) {
    // 使用正则表达式确保数值每三位有一个逗号作为千分位分隔符
    if (!isNaN(value)) {
      return value.replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
  }



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
        // the day before selected date
        const fcompared = dayjs(selectedDate, 'DD/MM/YYYY').subtract(1, 'days').format('YYYY-MM-DD');
        
        const tcompared = dayjs(tselectedDate, 'DD/MM/YYYY').subtract(1, 'days').format('YYYY-MM-DD');
        const params = {
          fselected: fselected,
          tselected: tselected, // 你可以根据需要修改这个值
          
          fcompared: fcompared,
          tcompared: tcompared, // 你可以根据需要修改这个值
          dateType: selectedDateType
        };
        const response = await axios.get(process.env.REACT_APP_SERVER_URL + '/searchSalesSummary', {
          ...config,
          params,
          withCredentials: true
        });

        if (!response.data.isAdmin) {
          setIsLoading(false);
          setDashboard_data(response.data.results);
          setSearchedDateType(response.data.DateType);
          
          processDashboardData(response.data.results, response.data.DateType);
          setHasBranch(response.data.hasBranchResult);

          setPosVersion(response.data.posVersion['PosVersion']);
          setIsAdmin(response.data.isAdmin);
          setIsUserFetched(true);

         
          if(response.data.hourlyResult){
           
          processHourlyData(response.data.hourlyResult);
          const dateRanges = response.data.hourlyResult.map((item) => {
            const key = Object.keys(item)[0];
            const [startDate, endDate] = key.split(' - ');
            return { startDate, endDate };
          });
          setHourlyRangeData(dateRanges);
          
          }
          
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



  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [selectedDateType, setSelectedDateType] = useState('day');

  const [vsOptions, setVsOptions] = useState(['Previous day', 'The same day of last week', 'The same day of last month']);

  const handleDateRangeSelect = (dateRange) => {

    //传入的是iso格式的日期，判断传入的日期是一整个月，还是一整个星期，还是一整天





    setSelectedDateRange(dateRange);

    
    const startDate = dayjs(dateRange.startDate);
    const endDate = dayjs(dateRange.endDate);

    setSelectedDate(startDate.format('DD/MM/YYYY'));
    setTSelectedDate(endDate.format('DD/MM/YYYY'));



    const isWholeMonth = startDate.date() === 1 && endDate.isSame(endDate.endOf('month'), 'day');
    const isWholeWeek = startDate.day() === 1 && endDate.day() === 0 && endDate.diff(startDate, 'days') === 6;
    const isSingleDay = startDate.isSame(endDate, 'day');
    const moreThanTwoWeek = endDate.diff(startDate, 'days') > 13;

    

  
    if (isWholeMonth) {
      setSelectedDateType("month");
      setVsOptions(['Previous month', 'The same month of last year']);
     
    } else if (isWholeWeek) {
     setSelectedDateType("week");
     setVsOptions(['Previous week']);       
    } else if (isSingleDay) {
      setSelectedDateType("day");
      setVsOptions(['Previous day', 'The same day of last week', 'The same day of last month']);
      
    } 
    else if (moreThanTwoWeek) {
      setSelectedDateType("weeks");
      
    }
    else{
      setSelectedDateType("days");
    }
  };
  useEffect(() => {

    if(selectedDateType === "day"){
      setDateType('vs Previous day')
    }
    else if(selectedDateType === "week"){
      setDateType('vs Previous week')
    }
    // else if(selectedDateType === "month"){
    //   setDateType('vs Previous month')
    // }
    else{
      setDateType(null);
    }
  }
  ,[selectedDateType])




  if (getIsLoading()) {
    return (
      <div className="loading-overlay">
        <CircularProgress className="loading-spinner"/>
      </div>
    );
  } 

  // else if (!getIsLoading() && !getIsAdmin() && getDashboard_data()) { 
    // console.log(NetSalesByDate.xAxisData1[2])
    // let daysOrHours = [];

    // if (dateType === 'Daily') {
    //   daysOrHours = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // } else if (dateType === 'Hourly') {
    //   daysOrHours = Array.from({ length: 24 }, (_, i) => {
    //     const hour = i % 12 === 0 ? 12 : i % 12;
    //     const period = i < 12 ? ' AM' : ' PM';
    //     return `${hour}${period}`;
    //   });
    // }
    //  else if (dateType === 'Weekly') {
    //   daysOrHours = Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
    // }else if (dateType === 'Monthly') {
    //   daysOrHours = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sep','Oct','Nov','Dec'];
    // }

    // function removeLastParenthesis(str) {
    //   const index = str.lastIndexOf('(');
    //   return index !== -1 ? str.substring(0, index).trim() : str;
    // }
    
   else if (!getIsLoading() && !getIsAdmin() && getDashboard_data()) { 
  
    
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
      <div className='content' >
      {/* <main className='main-content' > */}
      <div className='zdy-h'></div>
    
      <div className='left-column'style={{'marginLeft':'2.2rem'}}>
      <h1 className='h'>Sales Summary</h1>
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
      <div className="dashboard-wrapper">
        <div className='report-filter-desktop'>
          <div className="btn-group">


            
          <DropdownCalendar onRangeSelect={handleDateRangeSelect} />
          {selectedDateType && dateType!== null && (
            <Dropdown selected={dateType} setSelected={setDateType} options={vsOptions} />
            )} 
            <button className="ripple" onClick={handleSearch}>Search</button>

          </div>

          
        </div>
        <div className='main-content' >
          <div className='left-column' >
            <div className='card'>
              <div className='card-header'>
                <div className="card-title">
                  <p>Total Net Sales</p>
                </div>
                <div className="card-details">
                  <div className="amount">
                    <p style={colorStyle}>${formatCurrency(selectedTotalNetSales)}</p>
                  </div>
                  <div className="amount-text">
                    <p className="amount-description" style={{ fontSize: '14px', gap: '10px', display: 'flex', alignItems: 'center',whiteSpace:'nowrap' }}>
                      Amount
                      {percentageDifference !== 0 && !isNaN(percentageDifference) &&
                        <span className="percentage-difference" style={colorStyle}>
                          {arrowSymbol}{percentageDifference}%
                        </span>
                      }
                      {percentageDifference !== 0 && !isNaN(percentageDifference) &&
                        <span className="compared-sales">(vs ${formatCurrency(comparedTotalNetSales)})</span>
                      }
                    </p>
                  </div>
                  </div>
                  {/* {weeklySwitch !== null &&<div className='card-switch'>
                  <CustomSwitch 
                  checked={weeklySwitch}
                    checkedText="Daily" 
                    uncheckedText="Weekly" 
                    checkedColor="#1EB65C"
                    uncheckedColor="#2A30E8" 
                    onChange={handleSwitchChange }
                  />
                  </div>} */}<div className='chartType'> 
                  {dropdownOptions && 
                  <DropdownAntModule
                  key={`dropdown-${dropdownDefaultSelected}`} 
                    options={dropdownOptions}
                    defaultSelected={dropdownDefaultSelected}
                    onSelect={handleDropdownSelect}
                  />
                  }</div>
              </div>
              <div className="card-chart">
                {
                  searchedDateType === 'day' &&PeakLineChartData[0].length!==0 && <PeakLineChart data={PeakLineChartData}  />
                }
                {
                  searchedDateType === 'days' && chartType ==="Daily"&& xAxisData[0] && <DayLineChart dates1={xAxisData[0]} dates2={xAxisData[1]} values1={seriesData[0]} values2={seriesData[1]} />
                }
                { 
                  searchedDateType === 'days' && chartType ==="Hourly" && hourlyChartDataForDays&& hourlyChartDataForDays.length>0 && <HourlyForDaysChart chartData={hourlyChartDataForDays} />
                }
                {
                  searchedDateType === 'week' && chartType ==="Daily" && NetSalesByDate.xAxisData1.length !== 0 && <Mchart dateType={'Weekly'} data={NetSalesByDate} />
                }
                {
                  searchedDateType === 'week' && chartType ==="Hourly" && hourlyChartDataForDays && hourlyChartDataForDays.length>0&& <HourlyForDaysChart chartData={hourlyChartDataForDays} />
                }
                {
                  searchedDateType === 'month' && chartType === 'Hourly'  && hourlyChartDataForDays && hourlyChartDataForDays.length>0&& <HourlyForDaysChart chartData={hourlyChartDataForDays} />
                }
                {
                  searchedDateType === 'month' && chartType === 'Daily' && xAxisData[0] &&<DayLineChart dates1={xAxisData[0]} dates2={xAxisData[1]} values1={seriesData[0]} values2={seriesData[1]} />
                }
                {
                  searchedDateType === 'month' && chartType === 'Weekly' && weeklyChartData && <CustomBarChart data={weeklyChartData} />
                }
                {
                  searchedDateType === 'weeks' && chartType === 'Daily' &&  <DayLineChart dates1={xAxisData[0]} dates2={xAxisData[1]} values1={seriesData[0]} values2={seriesData[1]} />
                }
                {
                  searchedDateType === 'weeks' && chartType === 'Hourly' && hourlyChartDataForDays && hourlyChartDataForDays.length>0 && <HourlyForDaysChart chartData={hourlyChartDataForDays} />
                }
                {
                  searchedDateType === 'weeks' && chartType === 'Weekly' && weeklyChartData &&<CustomBarChart data={weeklyChartData} />
                }
                
              
              </div>
            </div>
          </div>
          { (hourlyChartDataForDays === null||hourlyChartDataForDays.length===0) && PeakLineChartData[0].length === 0 && NetSalesByDate.xAxisData1.length === 0 && weeklyChartData === null &&xAxisData[0]===undefined?
          <div>

            </div>:


          <div className='right-column1'>
      
            <div className='card'>
              <div className='card-header'>
                <div className='card-title'>
                {((searchedDateType === 'day')||(chartType === 'Hourly' &&  searchedDateType !== 'day'  && hourlyChartDataForDays )) &&
                  <p>Hourly Total Net Sales</p>
                }
                {chartType === 'Daily'&&searchedDateType!=='day' &&
                <p>
                  Daily Total Net Sales
                </p>
                }
                {
                chartType === 'Weekly' &&
                <p>
                  Weekly Total Net Sales
                </p>
                }
                </div>
              </div>
              <div className='table'>
                
                {searchedDateType === 'day' && 
              <table className="table-style">
               <thead>
                 <tr>
                   <th></th>
                   <th>{PeakLineChartData[2][0]}</th>
                   {PeakLineChartData[2][1]!== 'Invalid Date' && <th>{PeakLineChartData[2][1]}</th>}
                 </tr>
               </thead>
               <tbody>
                 {PeakLineChartData[0].map((item, index) => {
                   // 检查两个列表对应项的amount是否都不为0
                   if (item.amount !== 0 && PeakLineChartData[1][index].amount !== 0) {
                     return (
                       <tr key={item.hour}>
                         <td>{item.hour}H</td>
                         <td>${item.amount.toLocaleString()}</td>
                         <td>${PeakLineChartData[1][index].amount.toLocaleString()}</td>
                       </tr>
                     );
                   }
                   // 如果不符合条件，不渲染当前行
                   return null;
                 })}
               </tbody>
             </table>
             }
             {chartType === 'Daily' &&  searchedDateType!== 'week'&&searchedDateType!== 'day'&& xAxisData[0] &&
              <div className="table-container1">
              <table className="table-style">
               <tbody>

                  {
                    xAxisData[0].map((item, index) => {
                      return (
                        <tr key={item}>
                          <td>{item}</td>
                          <td>${seriesData[0][index].toLocaleString()}</td>
                          {xAxisData[1] && xAxisData[1][index]!==undefined &&<td style={{color:'#677483',fontSize:16,fontWeight:600,textAlign:'center' }}>{xAxisData[1][index]}</td>}
                          {seriesData[1] && seriesData[1][index]!==undefined &&<td>${seriesData[1][index].toLocaleString()}</td>}
                        </tr>
                      );
                    })
                  }
               </tbody>
             </table>
             </div>
             }
             {
              chartType === 'Daily' && searchedDateType === 'week' && NetSalesByDate.xAxisData1[0] &&
              <table className="table-style">
                <thead>
                  <tr>
                    <th></th>
                    <th style={{fontSize:14}}>{NetSalesByDate.xAxisData1[0].slice(0, 10)} ~ {NetSalesByDate.xAxisData1[NetSalesByDate.xAxisData1.length-1].slice(0, 10)}</th>
                    <th style={{fontSize:14}}>{NetSalesByDate.xAxisData2[0].slice(0, 10)} ~ {NetSalesByDate.xAxisData2[NetSalesByDate.xAxisData2.length-1].slice(0, 10)}</th>
                  </tr>
                </thead>
               <tbody>
                  {
                    weekDays.map((item, index) => {
                      return (
                        <tr key={item}>
                          <td className="first-column1">{item}</td>
                          <td>${NetSalesByDate.yAxisData1[index].toLocaleString()}</td>
                          <td>${NetSalesByDate.yAxisData2[index].toLocaleString()}</td>
                        </tr>
                      );
                    })
                  }
               </tbody>
              </table>
             }
            
            {
              chartType === 'Weekly' && (searchedDateType === 'month'||searchedDateType==='weeks') && weeklyChartData &&
              <table className="table-style">
                
               <tbody>
                  {
                    weeklyChartData.map((item, index) => {
                      return (
                        <tr key={item}>
                          <td>{dayjs(item.start).format('DD/MM/YYYY')} ~ {dayjs(item.end).format('DD/MM/YYYY')}</td>
                          
                          <td>${parseFloat(item.total).toLocaleString()}</td>
                        </tr>
                      );
                    })
                  }
               </tbody>
              </table>
             }
             {
              chartType === 'Hourly' &&  searchedDateType !== 'day'  && hourlyChartDataForDays && 
              <table className="table-style">
<thead>
  <tr>
    <th></th>
    {hourlyChartDataForDays.map((data, index) => (
      <th key={index} className="date-range-header">
        <span>{data.legend.split(' - ')[0]}</span> {/* 开始日期 */}
        <span>~</span> {/* 分隔符 */}
        <span>{data.legend.split(' - ')[1]}</span> {/* 结束日期 */}
      </th>
    ))}
  </tr>
</thead>



              <tbody>
                {hourlyChartDataForDays[0].hours.map((hour, hourIndex) => (
                  <tr key={hourIndex}>
                    <td>{`${hour}H`}</td>
                    {
                      hourlyChartDataForDays.map((data, dataIndex) => (
                        <td key={dataIndex}>
                          ${data.amounts[hourIndex] ? data.amounts[hourIndex].toLocaleString() : '0'}
                        </td>
                      ))
                    }

                  </tr>
                ))}
              </tbody>
            </table>
             }
                
              </div>
              
            </div>
            
          </div>
          }

        </div>
      </div> 
    </div>
 
    {/* </main> */}
          </div>
      </div>
    </div>
  );
}


};

export default SalesSummary;