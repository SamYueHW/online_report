import React from "react";
import Adminsidebar from "../../components/sidebar/Adminsidebar";
import axios from "axios";
import { useState, useEffect } from "react";
import { redirect, useNavigate } from "react-router-dom";
import moment from 'moment-timezone';
import useGetState from '../../hooks/useGetState';
import { CircularProgress } from '@mui/material';
import './admindashboard.scss';
import DatePicker from 'react-datepicker';
import SalesPieChart from "../../components/chart/SalesPieChart";

const Admindashboard = ({ }) => {
    const navigate = useNavigate();
    const australiaDate =  moment.tz('Australia/Sydney').format('YYYY-MM-DD');

    const [user, setUser, getUser] = useGetState(null);
    const [searchValue, setSearchValue] = useState('');
    const [selectedConnection, setSelectedConnection] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchCustomerEmail, setSearchCustomerEmail] = useState('');

    const [searchCustomerName, setSearchCustomerName] = useState('');
    const [customerListEmail, setCustomerListEmail] = useState('');

    const [editingCustomer, setEditingCustomer] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [category, setCategory, getCategory] = useGetState('');


    const [isAdmin, setIsAdmin, getIsAdmin] = useGetState(false);
    const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
    const [keys, setKeys, getKeys] = useGetState(null);

    const [dashboard_data, setDashboard_data, getDashboard_data] = useGetState(null);
    const [customerStoreMap, setCustomerStoreMap] = useState({});
    const [customerInfo, setCustomerInfo] = useState({}); 


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
    const [isCustomerListModalOpen, setIsCustomerListModalOpen] = useState(false);

    const [activationKeys, setActivationKeys] = useState([]); // 存储激活码
    const [isActivationModalOpen, setIsActivationModalOpen] = useState(false); // 控制激活码模态窗口

    const categoryOptions = [
      { value: "", label: "All (Category)" },
      { value: "melb", label: "Melb" },
      { value: "syd", label: "Syd" },
      { value: "qld", label: "Qld" },
    ];
    // Handle category change function
    const handleCategoryChange = (event) => {
      setSelectedCategory(event.target.value);
    };

    const generateActivationKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 20; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };
  
  
    const handleRegisterCustomer = async () => {
        try {
          const customerDataWithCategory = {
            ...customerData,
            category: category
          };
          const response = await axios.post(process.env.REACT_APP_SERVER_URL + '/registerCustomer', customerDataWithCategory);
            if (response.status === 200) {
                alert('Customer registered successfully.');
                setIsModalOpen(false);
                window.location.reload();  // 刷新页面
            } else {
                alert('Failed to register the customer.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to register the customer.');
        }
    };
    // 创建一个函数来渲染customerInfo中的数据
    const renderCustomerList = () => {
      const filteredCustomers = customerInfo.filter((customer) => {
        const matchesName = customer.CustomerName.toLowerCase().includes(searchCustomerName.toLowerCase());
        const matchesEmail = customer.email.toLowerCase().includes(customerListEmail.toLowerCase());
        return matchesName && matchesEmail;
      });
      
      return filteredCustomers.map((customer, index) => (
        <div key={customer.cus_id} className="customer-item">
          <div className="customer-info">
            <p>Name: {customer.CustomerName}</p>
            <p>Email: {customer.email}</p>
          </div>
          <div className="customer-actions">
            <button style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => handleEditCustomer(customer.cus_id)}>Edit</button>
            <button style={{ fontSize: '12px', padding: '6px 12px' }} className="delete-store-button" onClick={() => handleDeleteCustomer(customer.cus_id)}>Delete</button>
          </div>
        </div>
      ));
    };

// 添加handleEditCustomer和handleDeleteCustomer函数
const handleEditCustomer = (cus_id) => {
  const customer = customerInfo.find(c => c.cus_id === cus_id);
  setEditingCustomer(customer);
};


const handleDeleteCustomer = async (cus_id) => {
  try {
    const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
    const config = {
      headers: {
        'authorization': `Bearer ${token}`
      }
    };
    // 向服务器发送删除请求
    const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/deleteCustomer/${cus_id}`, config);
    
    if (response.status === 200) {
      alert('Customer deleted successfully.');
      // 在此处更新你的客户列表状态
      setCustomerInfo(customerInfo.filter(item => item.cus_id !== cus_id));
    } else {
      alert('Failed to delete the customer.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to delete the customer.');
  }
};


const handleUpdateCustomer = async () => {
  try {
    const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
    const config = {
      headers: {
        'authorization': `Bearer ${token}`
      }
    };
    // 创建一个新的对象，包含要发送到服务器的数据
  
    const response = await axios.put(`${process.env.REACT_APP_SERVER_URL}/updateCustomer/${editingCustomer.cus_id}`, editingCustomer, config);
    if (response.status === 200) {
      // 更新成功
      alert('Customer updated successfully');
      // 更新 customerInfo 状态
      const updatedCustomerInfo = customerInfo.map(c => {
        if (c.cus_id === editingCustomer.cus_id) {
          return editingCustomer;
        }
        return c;
      });
      setCustomerInfo(updatedCustomerInfo);
      
      setEditingCustomer(null);
    
    } else {
      alert('Failed to update the customer');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to update the customer');
  }
};




  const [formData, setFormData] = useState({
    storeName: '',
    appId: generateRandomId(),
    expireDate: getSixMonthsFromNow(),
    posVersion: 'Retail',
    category: getCategory(),
    
  });
  const [customerData, setCustomerData] = useState({
    email: '',
    name: '',
    password: '0000', 
    Address: '',
    ContactNumber: '',
    category: getCategory(),
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
        category: getCategory(),
      };
  
      const response = await axios.post(process.env.REACT_APP_SERVER_URL + '/createStore', dataToSend);
      
      if (response.status === 200) {
        alert('Store added successfully.');
        setIsAddStoreModalOpen(false);
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
  const handleDelete = async (storeId, linkedCustomers) => {
    if (linkedCustomers && linkedCustomers.length > 0) {
      const isConfirmed = window.confirm("There are customers linked to this store. Are you sure you want to delete this store?");
      if (!isConfirmed) {
        return;
      }
    }
    
    try {
      const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
      const config = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/deleteStore/${storeId}`, config);
      
      if (response.status === 200) {
        alert('Store deleted successfully.');
        setDashboard_data(dashboard_data.filter(item => item.StoreId !== storeId));
        
      } else {
        alert('Failed to delete the store.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete the store.');
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
                setUser(response.data.username);
                const ADMIN_EMAIL_LOTUS = 'admin@lotus.com.au';
                const ADMIN_EMAIL_IPOS = 'admin@i-pos.com.au';
                const ADMIN_EMAIL_QLD = 'admin@appliedtechs.com.au';
              
                
              
                if (response.data.username === ADMIN_EMAIL_LOTUS) {
                  setCategory('melb');
                } else if (response.data.username === ADMIN_EMAIL_IPOS) {
                  setCategory('syd');
                } else if (response.data.username === ADMIN_EMAIL_QLD) {
                  setCategory('qld');
                } else {
                  setCategory('syd');
                }

                
                  // 进行转换
                const newCustomerStoreMap = response.data.customer_store_data.reduce((acc, cur) => {
                  if (!acc[cur.StoreId]) {
                      acc[cur.StoreId] = [];
                  }
                  acc[cur.StoreId].push(cur);
                  return acc;
                }, {});

                // 更新状态
                setCustomerStoreMap(newCustomerStoreMap);
                setCustomerInfo(response.data.customer_data);
                
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
    const handleCustomerEmailSearchChange = (event) => {
      setSearchCustomerEmail(event.target.value);
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
      const matchesCategory = selectedCategory === "" || item.Category === selectedCategory; 

      const matchesCustomerEmail = customerStoreMap[item.StoreId] ? 
      customerStoreMap[item.StoreId].some((customer) => 
        customer.email.toLowerCase().includes(searchCustomerEmail.toLowerCase())) 
      : searchCustomerEmail === ''; // 如果没有与该店铺关联的客户信息，但用户也没有输入客户邮箱来搜索，则视为匹配

      return matchesSearch && matchesConnection && matchesStatus && matchesCategory && matchesCustomerEmail;
    });

    const activeStores = filteredData.filter(item => {
      const expiredDate = moment.utc(item.ReportLicenseExpire, "YYYY/MM/DD").local();
      const today = moment().startOf("day");
      return expiredDate.isAfter(today) && expiredDate.diff(today, "days") >= 10;
  });
  
  const almostExpiredStores = filteredData.filter(item => {
      const expiredDate = moment.utc(item.ReportLicenseExpire, "YYYY/MM/DD").local();
      const today = moment().startOf("day");
      return expiredDate.isAfter(today) && expiredDate.diff(today, "days") < 10;
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
        setIsAddStoreModalOpen(true);  // 更改为这个
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

      {isAddStoreModalOpen && (
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
            <button onClick={() => setIsAddStoreModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
    <div className="client_btn_container">
    <div>
 
  <button className="register-button" onClick={() => setIsModalOpen(true)}>Register Customer</button>
    {isModalOpen && (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Register Customer</h2>
                <label>
                    Email: 
                    <input type="email" value={customerData.email} 
                           onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })} />
                </label>
                <label>
                    Name: 
                    <input type="text" value={customerData.name} 
                           onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })} />
                </label>
                <label>
                    Contact Number: 
                    <input type="text" value={customerData.ContactNumber}
                           onChange={(e) => setCustomerData({ ...customerData, ContactNumber: e.target.value })} />
                </label>
                <label>
                    Password:
                    <input type="text" value={customerData.password}
                           onChange={(e) => setCustomerData({ ...customerData, password: e.target.value })} />
                </label>
                <label>
                    Address:
                    <input type="text" value={customerData.Address}
                            onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })} />
                </label>
                <button onClick={handleRegisterCustomer}>Submit</button>
                <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
        </div>
    )}

</div>
<div>
    <button className='customer_list_btn' onClick={() => setIsCustomerListModalOpen(true)}>Customer List</button>
    
    {isCustomerListModalOpen && (
      <div className="modal-overlay">
        <div className="modal">
          <h2>Customer List</h2>
          <div className="search-inputs">
        {/* 添加搜索客户名和客户邮箱的输入框 */}
        <input
          type="text"
          value={searchCustomerName}
          onChange={(e) => setSearchCustomerName(e.target.value)}
          placeholder="Search Customer Name"
        />
        <input
          type="text"
          value={customerListEmail}
          onChange={(e) => setCustomerListEmail(e.target.value)}
          placeholder="Search Customer Email"
        />
        
      </div>
          <div className="customer-list" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
         
            {renderCustomerList()}
          </div>
          <button onClick={() => setIsCustomerListModalOpen(false)}>Close</button>
        </div>
      </div>
    )}
      {editingCustomer && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>Edit Customer</h2>
      <label>
        Email:
        <input
          type="email"
          value={editingCustomer.email}
          onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
        />
      </label>
      <label>
        Name:
        <input
          type="text"
          value={editingCustomer.CustomerName}
          onChange={(e) => setEditingCustomer({ ...editingCustomer, CustomerName: e.target.value })}
        />
      </label>
      <label>
        Contact Number:
        <input
          type="number"
          value={editingCustomer.ContactNumber}
          onChange={(e) => setEditingCustomer({ ...editingCustomer, ContactNumber: e.target.value })}
        />
      </label>
      <label>
        Address:
        <input
          type="text"
          value={editingCustomer.Address}
          onChange={(e) => setEditingCustomer({ ...editingCustomer, Address: e.target.value })}
        />
      </label>
      <label>
        Password:
        <input
          type="text"
          
          onChange={(e) => setEditingCustomer({ ...editingCustomer, Password: e.target.value })}
        />
      </label>
      {/* 可以根据需要添加更多字段 */}
      <button onClick={handleUpdateCustomer}>Submit</button>
      <button onClick={() => setEditingCustomer(null)}>Cancel</button>
    </div>
  </div>
)}

  </div>
  </div>
  

            <input
              className="search-bar"
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search Store Name"
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
            <select style={{ appearance: "auto" }} value={selectedCategory} onChange={handleCategoryChange}>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <input
              className="search-bar"
              type="text"
              value={searchCustomerEmail}
              onChange={handleCustomerEmailSearchChange}
              placeholder="Search Customer Email"
          />
          <div style={{ marginLeft: '200px' }}>
            <p style={{ fontWeight: 'bold' }}>Total Stores: {filteredData.length}</p>
            <p style={{ fontWeight: 'bold' }}>
              Active Stores: <span>
                {activeStores.length + almostExpiredStores.length}
              </span>
            </p>
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
                <div className="store-container">
                <div className="left-section">
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
                      Last Report Upload: {moment(item.LastestReportUpdateTime).format('YYYY-MM-DD HH:mm')}
                      </p>
                    </div>
                  </div>
                  <p>
                    Expired Date:{" "}
                    <span className={`date ${status === "expired" ? "expired" : ""} ${status === "active" ? "active" : ""} ${status === "almost_expired" ? "almost_expired" : ""}`}>
                      {moment.utc(item.ReportLicenseExpire).local().format("DD/MM/YYYY")}
                    </span>
                  </p>
                  <div className="customer-list">
                  <h3>Customers:</h3>
                  {
                      customerStoreMap[item.StoreId] ?
                      customerStoreMap[item.StoreId].map((customer, index) => (
                          <div key={index}>
                              <p>{customer.email}</p>
                          </div>
                      )) : <p>No customers linked.</p>
                  }
                  </div>
                
              </div>
            
                <div className="store-buttons">
                  <button className="edit-button" onClick={() => handleEdit(item.StoreId)}>Edit</button>
                  <button className="delete-store-button" onClick={() => handleDelete(item.StoreId, customerStoreMap[item.StoreId])}>Delete</button>
                </div>

                </div>
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
