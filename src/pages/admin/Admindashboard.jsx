import React from "react";
import Adminsidebar from "../../components/sidebar/Adminsidebar";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import moment from 'moment-timezone';
import useGetState from '../../hooks/useGetState';
import { CircularProgress } from '@mui/material';
import './admindashboard.scss';
import DatePicker from 'react-datepicker';


const Admindashboard = ({ }) => {
    const navigate = useNavigate();
    const australiaDate =  moment.tz('Australia/Sydney').format('YYYY-MM-DD');

    const [user, setUser, getUser] = useGetState(null);
    const [searchValue, setSearchValue] = useState('');
    const [selectedConnection, setSelectedConnection] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    const [isAdmin, setIsAdmin, getIsAdmin] = useGetState(false);
    const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
    const [keys, setKeys, getKeys] = useGetState(null);

    const [dashboard_data, setDashboard_data, getDashboard_data] = useGetState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [activationKeys, setActivationKeys] = useState([]); // 存储激活码
    const [isActivationModalOpen, setIsActivationModalOpen] = useState(false); // 控制激活码模态窗口
    const generateActivationKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 20; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };
    const handleGenerateKey = async () => {
        const newKey = generateActivationKey();
        try {
            const response = await axios.post(process.env.REACT_APP_SERVER_URL + '/generateKey', {
            newKey,
            });
            if (response.status === 200) {
            // 更新激活码列表
            
            alert('Activation key generated successfully.');
            const respone_key = await axios.get(process.env.REACT_APP_SERVER_URL + '/getKeys', { withCredentials: true });
            if (respone_key){
                setKeys(respone_key.data.results);
            }
            else{
                alert('Failed to generate the activation key.');
            }}
            else{
                alert('Failed to generate the activation key.');
            }

        } catch (error) {
            console.log(error);
        }
    };
            


  const [formData, setFormData] = useState({
    storeName: '',
    appId: generateRandomId(),
    expireDate: getSixMonthsFromNow(),
    posVersion: 'Retail',
  });

  function generateRandomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function getSixMonthsFromNow() {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date;
  }

  const handleSubmit = async () => {
    try {
      // Replace with your server URL and endpoint
      const posVersionNum = formData.posVersion === "Retail" ? 0 : 1;

      // 创建一个新的对象，包含要发送到服务器的数据
      const dataToSend = {
        ...formData,
        posVersion: posVersionNum,
      };
  
      const response = await axios.post(process.env.REACT_APP_SERVER_URL + '/createStore', dataToSend);
      
      if (response.status === 200) {
        alert('Store added successfully.');
        setIsModalOpen(false);
        const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
        const config = {
            headers: {
            'authorization': `Bearer ${token}`
            }
        };
        const response = await axios.get(process.env.REACT_APP_SERVER_URL + '/dashboard', { ...config, withCredentials: true });
            
        if (response.data.success){
            setDashboard_data(response.data.store_data);
            setIsLoading(false);
            setIsAdmin(response.data.isAdmin);
        }
        else{
            navigate('/');
        }

      } else {
        alert('Failed to add the store.');
        }
      
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add the store.');
    }
  };


    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = async () => {
        try {
          await axios.get(process.env.REACT_APP_SERVER_URL + '/logout', { withCredentials: true });
          sessionStorage.removeItem('jwtToken');
          navigate('/');
        } catch (error) {
          console.log(error);
        }
    };
    useEffect(() => {
        // 在组件挂载时设置
        document.body.style.overflow = 'auto';  // 或者 'scroll'
    
        // 在组件卸载时还原
        return () => {
          document.body.style.overflow = 'hidden'; // 或者原来的值
        };
      }, []);
    
    useEffect(() => {
        const fetchDashboardData = async () => {
          try {
            const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
            const config = {
                headers: {
                'authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(process.env.REACT_APP_SERVER_URL + '/dashboard', { ...config, withCredentials: true });
            
            if (response.data.success){
                setDashboard_data(response.data.store_data);
                setIsLoading(false);
                setIsAdmin(response.data.isAdmin);
                setKeys(response.data.keys);
            }
            else{
                navigate('/');
            }
          } catch (error) {
            console.log(error);
            navigate('/');
          }
        };
    
        fetchDashboardData();
      }, []);
      if (getIsLoading()) {
        return (
          <div className="loading-overlay">
            <CircularProgress className="loading-spinner" />
          </div>
        );
      } 
    //   else if (!getIsLoading() && getIsAdmin() && getIsUserFetched() && getDashboard_data()) {
else if (!getIsLoading() && getIsAdmin() && getDashboard_data()) {
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
    const matchesSearch = String(item.StoreName).toLowerCase().includes(searchValue.toLowerCase());

    const matchesConnection =
        selectedConnection === "" || String(item.connection) === selectedConnection;

    let status = "";
    const expiredDate = moment.utc(item.ReportLicenseExpire).local();
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
    const openModalWithNewAppId = () => {
        const newAppId = generateRandomId();
        setFormData({
          ...formData,
          appId: newAppId
        });
        setIsModalOpen(true);
      };

 
    return (
        <div className="admin-container"  style={{overflow:'auto'}} >
        <Adminsidebar user={getUser()} onLogout={handleLogout} isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <main className="admin-main">
        <div className="admin-title">
            <h1>Admin Dashboard</h1>
        </div>
        <div className="main-store">
          <div className="search-bar-container">
          <div>
          <button className="add-store-button" onClick={openModalWithNewAppId}>Add Store</button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Store</h2>
            <label>
              Store Name: <input type="text" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} />
            </label>
            <label>
              App ID: {formData.appId}
            </label>
            <label>
              Expire Date: <DatePicker
                selected={formData.expireDate}
                onChange={(date) => setFormData({ ...formData, expireDate: date })}
                dateFormat="dd/MM/yyyy" // 更新这一行来设置日期格式
                />
            </label>
            <label>
              POS Version: <select style = {{appearance: "auto"}}value={formData.posVersion} onChange={(e) => setFormData({ ...formData, posVersion: e.target.value })}>
                <option value="Retail">Retail</option>
                <option value="Hospitality">Hospitality</option>
              </select>
            </label>
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
    <div>
    <button style = {{marginLeft:'200px'}}onClick={() => setIsActivationModalOpen(true)}>Client Activation Key</button>
    {isActivationModalOpen && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>Activation Keys</h2>
      <div className="key-list">
        <div className="key-list-header">
          <div className="key-id-header">ID</div>
          <div className="key-value-header">Key</div>
        </div>
        {getKeys().map((item, index) => (
          <div className="key-list-item" key={index}>
            <div className="key-id">{item.key_id}</div>
            <div className="key-value">{item.key_data}</div>
          </div>
        ))}
      </div>
      <button onClick={handleGenerateKey}>Generate Key</button>
      <button onClick={() => setIsActivationModalOpen(false)}>Close</button>
    </div>
  </div>
)}

</div>

            <input
              className="search-bar"
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search Store ID"
            />
            {/* <select value={selectedConnection} onChange={handleConnectionChange}>
              {connectionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select> */}
            <select  style = {{appearance: "auto"}} value={selectedStatus} onChange={handleStatusChange}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
         
          { 
        dashboard_data ? (
          filteredData.map((item) => {
            const expiredDate = moment.utc(item.ReportLicenseExpire, "YYYY/MM/DD").local();
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
              <div key={item.StoreId} className={`store ${statusClassName}`}>
                <div className="store-header">
                  {/* {item.connection === 1 && <button disabled className="connected-button">Connected</button>}
                  {item.connection === 0 && <button disabled className="disconnected-button">Disconnected</button>} */}
                  <div className="store-name">
                    <p>Store Name: {item.StoreName}</p>
                  </div>
                  <div className="store-id">
                    <p>Shop ID: {item.StoreId}</p>
                  </div>
                  <div className="appid">
                    <p>App ID: {item.AppId}</p>
                  </div>
                  <div className="pos">
                  <p>
                    Pos Version: {item.PosVersion === 0 ? "Retail" : (item.PosVersion === 1 ? "Hospitality" : "null")}
                  </p>
                  </div>
                  <div className="last-update">
                  <p>
                    Last Reoort Upload: {moment(item.LastestReportUpdateTime).format('YYYY-MM-DD HH:mm')}
                    </p>


                  </div>
                </div>
                <p>
                  Expired Date:{" "}
                  <span className={`date ${status === "expired" ? "expired" : ""} ${status === "active" ? "active" : ""} ${status === "almost_expired" ? "almost_expired" : ""}`}>
                    {moment.utc(item.ReportLicenseExpire).local().format("DD/MM/YYYY")}
                  </span>
                </p>
                {/* <p>Store ID: {item.store_id}</p> */}
                {/* {item.ReportFunction === 1 && (
                //   <button disabled>Online Report</button>
                  // Add your chart component or other content here
                )} */}
                <button className="edit-button" onClick={() => handleEdit(item.StoreId)}>Edit</button>
                {/* <button className="history-button" onClick={() => handleHistory(item.StoreId)}>History</button> */}
              </div>
            );
          })) : (
            <div className="loading">
              <div className="loading-spinner"></div>
            </div>
          )
        }
        </div>
        </main>
      </div>
    
    );
}

};
export default Admindashboard;
