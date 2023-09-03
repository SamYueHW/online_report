import axios from 'axios';
import React, { useState, useEffect } from 'react';
import "./dashboardnew.scss";
import Sidebar from '../../components/sidebar/Sidebarnew';
import Adminsidebar from '../../components/sidebar/Adminsidebar';
import { useNavigate } from 'react-router-dom';
import useGetState from '../../hooks/useGetState';
import moment from 'moment-timezone';
import { CircularProgress } from '@mui/material';

const Dashboardnew = () => {
  const [user, setUser, getUser] = useGetState(null);
  const [isUserFetched, setIsUserFetched, getIsUserFetched] = useGetState(false);
  const [isAdmin, setIsAdmin, getIsAdmin] = useGetState(false);

  const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
  const [dashboard_data, setDashboard_data, getDashboard_data] = useGetState(null);

  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState('');
  const [selectedConnection, setSelectedConnection] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 

    // 设置澳大利亚悉尼时区的当前日期
  const australiaDate = moment.tz('Australia/Sydney').format('YYYY-MM-DD');

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

      
      const response = await axios.get(process.env.REACT_APP_SERVER_URL + '/searchreport', {
        ...config,
        params,
        withCredentials: true
      });
      // 处理响应结果
      if (response.status === 200) {
        // console.log(response.data.results);
        setDashboard_data(response.data.results);
     
        // setUser(response.data.username);
        setIsAdmin(response.data.isAdmin);
        setIsUserFetched(true);
        navigate('/dashboard');
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
        
        const params = {
          fselected: selectedDate,
          tselected: tselectedDate, // 你可以根据需要修改这个值
          fcompared: comparedDate,
          tcompared: tcomparedDate // 你可以根据需要修改这个值
        };
        const response = await axios.get(process.env.REACT_APP_SERVER_URL + '/searchreport', {
          ...config,
          params,
          withCredentials: true
        });

        if (!response.data.isAdmin) {
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

  let selectedDateData = {};
  let comparedDateData = {};
  
  if (Array.isArray(getDashboard_data())) {
    getDashboard_data().forEach(dashboardData => {
      Object.entries(dashboardData).forEach(([dateRange, data]) => {
        const [startDate, endDate] = dateRange.split(' - ');
  
        // 对比日期并获取相应数据
        if (startDate === formatDate(selectedDate) && endDate === formatDate(tselectedDate)) {
          selectedDateData = data[0];
        }
  
        if (startDate === formatDate(comparedDate) && endDate === formatDate(tcomparedDate)) {
          comparedDateData = data[0];
        }
      });
    });
  }
  

  return (
    <div className="container">
      <Sidebar user={getUser()} onLogout={handleLogout} isOpen={isSidebarOpen} />
      <main>
        <div className="analyze-table">
          <h1>Sales Summary</h1>
          <div className="date">
            <h2>Selected Date</h2>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            to
            <input type="date" value={tselectedDate} onChange={(e) => setTSelectedDate(e.target.value)} />  
          </div>
          <div className="date">
            <h2>Compared Date</h2>
            <input type="date" value={comparedDate} onChange={(e) => setComparedDate(e.target.value)} />
            to
            <input type="date" value={tcomparedDate} onChange={(e) => setTComparedDate(e.target.value)} />
          </div>
          <button className="ripple" onClick={handleSearch}>Search</button>
          <table>
          <thead>
          <tr>
            <th></th>
            <th>
              {
                isCurrentDate ? `Current Date: ${selectedDate}` : 
                (selectedDate === tselectedDate ? `Selected Date: ${selectedDate}` : `Selected Date Range: ${selectedDate} to ${tselectedDate}`)
              }
            </th>
            {
              (comparedDate && tcomparedDate ) && (
                <th>
                  {
                    comparedDate === tcomparedDate ? `Compared Date: ${comparedDate}` : `Compared Date Range: ${comparedDate} to ${tcomparedDate}`
                  }
                </th>
              )
            }
          </tr>
        </thead>
        <tbody>
        {
          // 显示解析后的数据
          Object.keys(selectedDateData).map((key, index) => (
            <tr key={index}>
              <td className="left-align">{addSpacesToCamelCase(key)}</td>
              <td>{typeof selectedDateData[key] === 'number' ? selectedDateData[key].toLocaleString() : selectedDateData[key] || 0}</td>
              {
                (comparedDate && tcomparedDate && Object.keys(comparedDateData).length > 0) ? 
                <td>{typeof comparedDateData[key] === 'number' ? comparedDateData[key].toLocaleString() : comparedDateData[key] || 0}</td>: null
              }6
            </tr>
          ))
        }
        </tbody>

          </table>
        </div> 
      </main>
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
};

export default Dashboardnew;
