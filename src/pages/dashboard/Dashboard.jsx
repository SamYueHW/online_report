import axios from 'axios';
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
  const [user, setUser] = useState(null);
  const [widgetOrderData, setWidgetOrderData] = useState(null);
  const [widgetAmountData, setWidgetAmountData] = useState(null);
  const [widgetMonthData, setWidgetMonthData] = useState(null);
  const [widgetLastMonthData, setWidgetLastMonthData] = useState(null);
  const [chartSalesData, setChartSalesData] = useState(null);
  const [chartCategoryData, setChartCategoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:3001/user', { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      const socket = io("http://localhost:3001");

      socket.on("connect", () => {
        console.log("Socket.IO connected");
      });

      const fetchData = async () => {
        try {
          const startTime = new Date();
          socket.emit('fetchData', { store_id: "1", date1: null, date2: null, type: "dashboard" });

          socket.on("dashboard_data", (data) => {
            const endTime = new Date();
            const elapsedTime = endTime - startTime;
            console.log("Total time:", elapsedTime);

            const storeId = data[0][0];
            const type = data[0][1];
            if (storeId === "1" && type === "dashboard") {
              const widgetOrderData = data[2][0];
              setWidgetOrderData(widgetOrderData);
              const widgetAmountData = data[2][1];
              setWidgetAmountData(widgetAmountData);
              const widgetMonthData = data[2][2];
              setWidgetMonthData(widgetMonthData);
              const widgetLastMonthData = data[2][3];
              setWidgetLastMonthData(widgetLastMonthData);

              const data1 = data[1][0];
              const data2 = data[1][1];

              const xAxisData2 = data1.filter((_, index) => index % 2 === 0);
              const yAxisData2 = data1.filter((_, index) => index % 2 === 1);
              const xAxisData1 = data2.filter((_, index) => index % 2 === 0);
              const yAxisData1 = data2.filter((_, index) => index % 2 === 1);

              while (xAxisData1.length < xAxisData2.length) {
                xAxisData1.push("");
                yAxisData1.push(0);
              }

              const chartSalesData = {
                xAxisData1: xAxisData1,
                xAxisData2: xAxisData2,
                yAxisData1: yAxisData1,
                yAxisData2: yAxisData2,
              };

              setChartSalesData(chartSalesData);

              const originalCategoryData = data[3];
              const chartCategoryData = [];
              for (let i = 0; i < originalCategoryData.length; i += 2) {
                const name = originalCategoryData[i];
                const value = originalCategoryData[i + 1];
                chartCategoryData.push({ name, value });
              }

              setChartCategoryData(chartCategoryData);
              setIsLoading(false);
            }
          });
        } catch (error) {
          console.log(error);
        }
      };

      fetchData();

      const disconnectTimeout = setTimeout(() => {
        socket.disconnect();
        console.log("Socket.IO disconnected after 5 minutes");
      }, 5 * 60 * 1000);

      return () => {
        clearTimeout(disconnectTimeout);
        socket.disconnect();
      };
    }
  }, [user]);

  if (!user || isLoading) {
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
          <MChart title="Sales Analyze" data={chartSalesData} aspect={2 / 1} />
          <Chart title="Month Category Sales" data={chartCategoryData} aspect={2 / 1} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
