import axios from 'axios';
import React, { useState, useEffect } from 'react';
import "./dashboard.scss";
// import Sidebar from '../../components/sidebar/Sidebar';
import Sidebar from '../../components/sidebar/Sidebarnew';
import Adminsidebar from '../../components/sidebar/Adminsidebar';
import Widget from '../../components/widget/Widget';
import Chart from '../../components/chart/Chart';
import MChart from '../../components/mchart/Mchart';
import { CircularProgress } from '@mui/material';
import Leaderboard from '../../components/leaderboard/Leaderboard';
import { useNavigate } from 'react-router-dom';
import useGetState from '../../hooks/useGetState';
import moment from 'moment';


const Dashboard = () => {
  const [user, setUser, getUser] = useGetState(null);
  const [isUserFetched, setIsUserFetched, getIsUserFetched] = useGetState(false);
  const [isAdmin, setIsAdmin, getIsAdmin] = useGetState(false);
  const [store, setStore, getStore] = useGetState(null);
  const [widgetOrderData, setWidgetOrderData] = useState(null);
  const [widgetAmountData, setWidgetAmountData] = useState(null);
  const [widgetMonthData, setWidgetMonthData] = useState(null);
  const [widgetLastMonthData, setWidgetLastMonthData] = useState(null);
  const [chartSalesData, setChartSalesData] = useState(null);
  const [chartCategoryData, setChartCategoryData] = useState(null);
  const [leaderboardData, setleaderboardData] = useState(null);
  const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
  const [dashboard_data, setDashboard_data, getDashboard_data] = useGetState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState('');
  // Set the initial selected connection
  const [selectedConnection, setSelectedConnection] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");


  const handleLogout = async () => {
    try {
      await axios.get(process.env.REACT_APP_SERVER_URL+'/logout', { withCredentials: true });
      setUser(null);
      setStore(null);
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_SERVER_URL+'/user', { withCredentials: true });
        
        if (!response.data.isAdmin) {
          setStore(response.data.data[0][0]);
          setDashboard_data(response.data.data);
          setUser(response.data.username);
          setIsAdmin(response.data.isAdmin);
          setIsUserFetched(true);
          setIsLoading(false);
        } 
        else {

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
      const data = getDashboard_data();
      console.log(getDashboard_data());
      const storeId = data[0][0];
      const type = data[0][1];
      console.log(data);
      if (storeId === getStore() && type === "dashboard") {
        setWidgetOrderData(data[2][0]);
        setWidgetAmountData(data[2][1]);
        setWidgetMonthData(data[2][2]);
        setWidgetLastMonthData(data[2][3]);

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
        
        setleaderboardData(data[4]);
        setIsLoading(false);
      }
    }
  }, [getIsUserFetched(), getIsAdmin(), getDashboard_data()]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const closeSidebar = (e) => {
      if (!e.target.closest('.sidebar') && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('click', closeSidebar);

    return () => {
      document.removeEventListener('click', closeSidebar);
    };
  }, [isSidebarOpen]);


  if (getIsLoading()) {
    return (
      <div className="loading-overlay">
        <CircularProgress className="loading-spinner" />
      </div>
    );
  } else if (!getIsLoading() && !getIsAdmin() && getIsUserFetched() && getDashboard_data() && getStore() && leaderboardData) {
    return (
      <div className="home">
        <Sidebar user={getUser()} onLogout={handleLogout} isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <div className='homeContainer'>
          <div className="left">
            <div className="widgets">
              <Widget type="order" data={widgetOrderData} />
              <Widget type="earnings" data={widgetAmountData} />
              <Widget type="month_earnings" data={[widgetMonthData, widgetLastMonthData]} />
            </div>
            <div className="charts">
              <MChart title="Sales Analyze" data={chartSalesData} aspect={2 / 1} />
              <Chart title="Month Category Sales" data={chartCategoryData} aspect={2 / 1} />
            </div>
          </div>
          <div className="right">
            <div className="leaderboard-container">
              <Leaderboard data={leaderboardData} />
            </div>
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
      <div className="home">
        <Adminsidebar user={getUser()} onLogout={handleLogout} isOpen={isSidebarOpen} onToggle={toggleSidebar} />
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
      </div>
    );
  }
  

}

export default Dashboard;
