


import React, { useState, useEffect } from 'react';
import "./dashboard.scss"
import Sidebar from '../../components/sidebar/Sidebar'
import Navbar from '../../components/navbar/Navbar'
import Widget from '../../components/widget/Widget'
import Chart from '../../components/chart/Chart'
import MChart from '../../components/mchart/Mchart'
import { CircularProgress } from '@mui/material';

import io from "socket.io-client";

const Dashboard = () => {
  const [widgetOrderData, setWidgetOrderData] = useState(null);
  const [widgetAmountData, setWidgetAmountData] = useState(null);
  const [widgetMonthData, setWidgetMonthData] = useState(null);
  const [widgetLastMonthData, setWidgetLastMonthData] = useState(null);
  const [ChartSalesData, setChartSalesData] = useState(null);
  const [ChartCategoryData, setChartCategoryData] = useState(null);

  const [isLoading, setIsLoading] = useState(true); // 添加 loading 状态
  

  useEffect(() => {
    // 创建 Socket.IO 连接
    const socket = io("http://localhost:3001");
    // 处理连接建立事件
    socket.on("connect", () => {
      console.log("Socket.IO connected");
      // 在连接建立后，可以发送初始消息或执行其他操作
      
    });

   
     // 记录开始时间戳
    const startTime = new Date();
    socket.emit('fetchData',  { store_id: "1", date1: null, date2: null, type:"dashboard"});

     // 处理消息接收事件
    socket.on("dashboard_data", (data) => {
      //console.log(data)
      // 计算总共用时
      const endTime = new Date();
      const elapsedTime = endTime - startTime;
      console.log("Total time:", elapsedTime);

      const storeId = data[0][0];
      const type = data[0][1];
      if (storeId == "1" && type == "dashboard") {
        const widgetOrderData = data[2][0];
        setWidgetOrderData(widgetOrderData);
        const widgetAmountData = data[2][1];
        setWidgetAmountData(widgetAmountData);
        const widgetMonthData = data[2][2];
        setWidgetMonthData(widgetMonthData);
        const widgetLastMonthData = data[2][3];
        setWidgetLastMonthData(widgetLastMonthData);
        
        // const xAxisData1 = [];
        // const xAxisData2 = [];
        // const yAxisData1 = [];
        // const yAxisData2 = [];

        // data[1][0].forEach((item, index) => {
        //   if (index % 2 === 0) {
        //     xAxisData1.push(item);
        //   } else {
        //     yAxisData1.push(item);
        //   }
        // });
        
        // data[1][1].forEach((item, index) => {
        //   if (index % 2 === 0) {
        //     xAxisData2.push(item);
        //   } else {
        //     yAxisData2.push(item);
        //   }
        // });
        const data1 = data[1][0];
        
        const data2 =  data[1][1];

       // 偶数索引的元素为 x 轴数据，奇数索引的元素为 y 轴数据
        const xAxisData2 = data1.filter((_, index) => index % 2 === 0);
       
        const yAxisData2 = data1.filter((_, index) => index % 2 === 1);


        const xAxisData1 = data2.filter((_, index) => index % 2 === 0);
        const yAxisData1 = data2.filter((_, index) => index % 2 === 1);
        // 填充data2到与data1相同的长度
        while (xAxisData1.length < xAxisData2.length) {
          xAxisData1.push("");
          yAxisData1.push(0);
        }


        const chartData = {
          xAxisData1,
          yAxisData1,
          xAxisData2,
          yAxisData2
        };

        const ChartSalesData = {
          xAxisData1: xAxisData1,
          xAxisData2: xAxisData2,
          yAxisData1: yAxisData1,
          yAxisData2: yAxisData2,
        };

        setChartSalesData(ChartSalesData);
        console.log(ChartSalesData)

        const originalCategoryData = data[3];
        const ChartCategoryData = [];
        for (let i = 0; i < originalCategoryData.length; i += 2) {
          const name = originalCategoryData[i];
          const value = originalCategoryData[i + 1];
          ChartCategoryData.push({ name, value });
        }
        setChartCategoryData(ChartCategoryData);




        setIsLoading(false); // 设置isLoading为false

      }
      
    });
    

     // 设置定时器，在五分钟后执行断开连接的操作
    const disconnectTimeout = setTimeout(() => {
      socket.disconnect();
      console.log("Socket.IO disconnected after 5 minutes");
    }, 5 * 60 * 1000); // 五分钟，单位为毫秒

    // 在组件卸载时关闭 Socket.IO 连接
    return () => {
      
      
      clearTimeout(disconnectTimeout);
      socket.disconnect();
    };
  }, []); // 空数组作为依赖项，仅在组件挂载和卸载时执行一次



  if (isLoading) {
    return (
      <div className="loading-overlay">
        <CircularProgress className="loading-spinner" />
      </div>
    );
  }
  






  return (
    <div className="home">
      <Sidebar />
      <div className='homeContainer'>
        <Navbar />
        {isLoading ? (
          <div className="loading-overlay">
            <CircularProgress className="loading-spinner" />
          </div>
        ) : (
          <div className="widgets">
            <Widget type="order" data={widgetOrderData} />
            <Widget type="earnings" data={widgetAmountData} />
            <Widget type="month_earnings" data={[widgetMonthData, widgetLastMonthData]} />
          </div>
        )}
        <div className="charts">
          <MChart title="Sales Analyze" data={ChartSalesData} aspect={2 / 1} /> 
          <Chart title="Month Category Sales" data={ChartCategoryData} aspect={2 / 1} />
          

          
        </div>
      </div>
    </div>
  );
}

export default Dashboard;