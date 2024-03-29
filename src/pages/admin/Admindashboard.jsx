import React from "react";
import Adminsidebar from "../../components/sidebar/Adminsidebar";
import axios from "axios";
import { useState, useEffect } from "react";
import { redirect, useNavigate } from "react-router-dom";
import moment from 'moment-timezone';
import useGetState from '../../hooks/useGetState';
import { CircularProgress } from '@mui/material';
import './admindashboard.scss';
// import DatePicker from '../../components/datepicker/Datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DatePickerComponent from "../../components/datepicker/Datepicker";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // 导入 UTC 插件
import timezone from 'dayjs/plugin/timezone'; // 导入时区插件
import { set } from "date-fns";
import { defaultTheme } from "antd/es/theme/context";


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
    const [defaultLocation, setdefaultLocation] = useState('');


    const [isAdmin, setIsAdmin, getIsAdmin] = useGetState(false);
    const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
    const [keys, setKeys, blegetKeys] = useGetState(null);

    const [dashboard_data, setDashboard_data, getDashboard_data] = useGetState(null);
    const [customerStoreMap, setCustomerStoreMap] = useState({});
    const [customerInfo, setCustomerInfo] = useState({}); 


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
    const [isCustomerListModalOpen, setIsCustomerListModalOpen] = useState(false);
    
    const [isActivateReportModalOpen, setIsActivateReportModalOpen] = useState(false);
    const [activeReportData, setActiveReportData] = useState(false);

    const [isActivateQROrderModalOpen, setIsActivateQROrderModalOpen] = useState(false);
    const [qrOrderData, setQROrderData] = useState(false);

    const [selectedQRStatus, setSelectedQRStatus] = useState("");
    const QRStatusOptions = [
      { value: "all", label: "All (QR Status)" },
      { value: "active", label: "Active" },
      { value: "expired", label: "Expired" },
      { value: "almost_expired", label: "Almost Expired (within 10 days)" },
    ];
    


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


    const handleActivateReportClick = (storeId) => {
      // Set the activeReportData based on the storeId if needed
      // For now, just opening the modal with a new random appId
      setActiveReportData({
        ...activeReportData,
        storeId: storeId,
        appId: generateRandomId(),
        expireDate:getSixMonthsFromNow(), 
      });
      setIsActivateReportModalOpen(true);
    };

    const handleActivateQROrderClick = (storeId) => {
      setQROrderData({
        ...qrOrderData,
        storeId: storeId,
        appId: generateRandomId(),
        expireDate:getSixMonthsFromNow(), 
        StripePrivateKey: '',
        StripeWebhookKey: '',
        //经纬度
        StoreLatitude: '',
        StoreLongitude: '',
        StoreLocationRange: 50,
       
        
      });
      setIsActivateQROrderModalOpen(true);
    };
    
    const handleSaveActiveReport = async () => {
      try {
        const token = sessionStorage.getItem('jwtToken');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        activeReportData.expireDate = dayjs(activeReportData.expireDate).format('YYYY-MM-DD');


        const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/activeReport`, activeReportData, config);
        if (response.status === 200) {
          alert('Active Report updated successfully.');
          setIsActivateReportModalOpen(false);
          window.location.reload();  // 刷新页面
         
        } else {
          alert('Failed to update the Active Report.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to update the Active Report.');
      }
    };

    const handleSaveQROrder = async () => {
      try {
        const token = sessionStorage.getItem('jwtToken');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        qrOrderData.expireDate = dayjs(qrOrderData.expireDate).format('YYYY-MM-DD');


        const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/activeQROrder`, qrOrderData, config);
        if (response.status === 200) {
          alert('QR Order activated successfully.');
          setIsActivateQROrderModalOpen(false);
          window.location.reload();  
         
        } else {
          alert('Failed to activate the QR Order.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to activate QR Order.');
      }
     
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
            <button className="commonbtn" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => handleEditCustomer(customer.cus_id)}>Edit</button>
            <button className="commonbtn delete-store-button" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => handleDeleteCustomer(customer.cus_id)}>Delete</button>
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
    // appId: generateRandomId(),
    // expireDate: getSixMonthsFromNow(),
    posVersion: 'Retail',
    category: getCategory(),
    Location: 'Melbourne',
    
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

  
  // 使用插件

  dayjs.extend(utc);
  dayjs.extend(timezone);
  
  function getSixMonthsFromNow() {
    // 设置默认时区
    dayjs.tz.setDefault("Australia/Sydney");
    
    // 获取当前时间并加上六个月
    return dayjs().tz('Australia/Sydney').add(6, 'month');
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
                console.log(response.data.store_data)
               
                setIsLoading(false);
                setIsAdmin(response.data.isAdmin);
                setUser(response.data.username);
                const ADMIN_EMAIL_LOTUS = 'admin@lotus.com.au';
                const ADMIN_EMAIL_IPOS = 'admin@i-pos.com.au';
                const ADMIN_EMAIL_QLD = 'admin@appliedtechs.com.au';
              
                
              
                if (response.data.username === ADMIN_EMAIL_LOTUS) {
                  setCategory('melb');
                  setdefaultLocation('Melbourne');
                  
                } else if (response.data.username === ADMIN_EMAIL_IPOS) {
                  setCategory('syd');
                  setdefaultLocation('Sydney');
                } else if (response.data.username === ADMIN_EMAIL_QLD) {
                  setCategory('qld');
                  setdefaultLocation('Brisbane');
                } else {
                  setCategory('syd');
                  setdefaultLocation('Sydney');
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
    { value: "all", label: "All (Report Status)" }, // Add "all" option
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

    const handleQRStatusChange = (event) => {
      setSelectedQRStatus(event.target.value);
    };

    // Filter data based on search value, selected connection, and selected status
    const filteredData = getDashboard_data().filter((item) => {
      const matchesSearch = String(item.StoreName).toLowerCase().includes(searchValue.toLowerCase());

      const matchesConnection =
          selectedConnection === "" || String(item.connection) === selectedConnection;

      let status = "";
      let QRstatus = "";
      const expiredDate = moment.utc(item.ReportLicenseExpire).local();
      const QRexpiredDate = moment.utc(item.QROrderLicenseExpire).local();
      const today = moment().startOf("day");

      if (expiredDate.isSameOrBefore(today)) {
          status = "expired";
      } else if (expiredDate.diff(today, "days") >= 10) {
          status = "active";
      } else {
          status = "almost_expired";
      }
      if (QRexpiredDate.isSameOrBefore(today)) {
        QRstatus = "expired";
      } else if (QRexpiredDate.diff(today, "days") >= 10) {
        QRstatus = "active";
      } else {
        QRstatus = "almost_expired";
      }


      const matchesStatus =
          selectedStatus === "all" || selectedStatus === "" || status === selectedStatus;
      const matchesCategory = selectedCategory === "" || item.Category === selectedCategory; 
      const matchesQRStatus =
      selectedQRStatus === "all" || selectedQRStatus === "" || QRstatus === selectedQRStatus;

      const matchesCustomerEmail = customerStoreMap[item.StoreId] ? 
      customerStoreMap[item.StoreId].some((customer) => 
        customer.email.toLowerCase().includes(searchCustomerEmail.toLowerCase())) 
      : searchCustomerEmail === ''; 
      return matchesSearch && matchesConnection && matchesStatus && matchesCategory && matchesCustomerEmail && matchesQRStatus;
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
        setIsAddStoreModalOpen(true);  
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
              POS Version: <select style = {{appearance: "auto"}}value={formData.posVersion} onChange={(e) => setFormData({ ...formData, posVersion: e.target.value })}>
                <option value="Retail">Retail</option>
                <option value="Hospitality">Hospitality</option>
              </select>
            </label>
            {/* dropdown list, Melbourne/Sydney/Brisbane */}
            <label>
              Location: <select style = {{appearance: "auto"}} defaultValue={defaultLocation} onChange={(e) => setFormData({ ...formData, Location: e.target.value })}>
                <option value="Melbourne">Melbourne</option>
                <option value="Sydney">Sydney</option>
                <option value="Brisbane">Brisbane</option>
              </select>
            </label>
            <button className="commonbtn" onClick={handleSubmit}>Submit</button>
            <button className="commonbtn" onClick={() => setIsAddStoreModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {isActivateReportModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Active Online Report</h2>
            <label>
              App ID: {activeReportData.appId}
            </label>
            <label>
              Expire Date: <DatePickerComponent
                value={activeReportData.expireDate}
                onChange={(date) => setActiveReportData({ ...activeReportData, expireDate: date })}
                
              />
            </label>
            <button className="commonbtn" onClick={handleSaveActiveReport}>Save</button>
            <button className="commonbtn" onClick={() => setIsActivateReportModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {isActivateQROrderModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Activate QR Order</h2>
            <label>
              App ID: {qrOrderData.appId}
            </label>
            <label>
              Expire Date: <DatePickerComponent
                value={qrOrderData.expireDate}
                onChange={(date) => setQROrderData({ ...qrOrderData, expireDate: date })}
              />
            </label>
            
            {/* set up stripe code*/}
            <label>
              Stripe Key: <input type="text"  onChange={(e) => setQROrderData({ ...qrOrderData, StripePrivateKey: e.target.value })} />
            </label>
            <label>
              Stripe Webhook Key: <input type="text"  onChange={(e) => setQROrderData({ ...qrOrderData, StripeWebhookKey: e.target.value })} />
            </label>

            <label>
              Store Url:
              <input type="text"  onChange={(e) => setQROrderData({ ...qrOrderData, StoreUrl: e.target.value })} />
            </label>
            {/* 经纬度*/}
            <label>
              Store Latitude:
              <input type="number"  onChange={(e) => setQROrderData({ ...qrOrderData, StoreLatitude: e.target.value })} />
            </label>
            <label>
              Store Longitude:
              <input type="number"  onChange={(e) => setQROrderData({ ...qrOrderData, StoreLongitude: e.target.value })} />
            </label>


            


            <button className="commonbtn" onClick={handleSaveQROrder}>Save</button>
            <button className="commonbtn" onClick={() => setIsActivateQROrderModalOpen(false)}>Cancel</button>
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
                <button className="commonbtn" onClick={handleRegisterCustomer}>Submit</button>
                <button className="commonbtn" onClick={() => setIsModalOpen(false)}>Cancel</button>
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
          <button className="commonbtn" onClick={() => setIsCustomerListModalOpen(false)}>Close</button>
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
     
      <button className="commonbtn" onClick={handleUpdateCustomer}>Submit</button>
      <button className="commonbtn" onClick={() => setEditingCustomer(null)}>Cancel</button>
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
            <select  style = {{appearance: "auto"}} value={selectedStatus} onChange={handleStatusChange}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select style={{ appearance: "auto" }} value={selectedQRStatus} onChange={handleQRStatusChange}>
              {QRStatusOptions.map((option) => (
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
            let QRstatus = "";

            if (expiredDate.isSameOrBefore(today)) {
              status = "expired";
            } else if (expiredDate.diff(today, "days") >= 10) {
              status = "active";
            } else {
              status = "almost_expired";
            }
            const QRexpiredDate = moment.utc(item.QROrderLicenseExpire, "YYYY/MM/DD").local();
            if (QRexpiredDate.isSameOrBefore(today)) {
              QRstatus = "expired";
            } else if (QRexpiredDate.diff(today, "days") >= 10) {
              QRstatus = "active";
            } else {
              QRstatus = "almost_expired";
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
                    <div className="store-name">
                      <p>Store Name: {item.StoreName}</p>
                    </div>
                    <div className="pos">
                    <p>
                      Pos Version: {item.PosVersion === 0 ? "Retail" : (item.PosVersion === 1 ? "Hospitality" : "null")}
                    </p>
                    </div>
                   
                    <div className="store-id">
                    <p style={{
                        userSelect: item.LastestReportUpdateTime === null ? "text" : "none"
                    }}>Store ID: {item.StoreId}</p>
                    </div>
                    {/* <div className="store-id">
                      <p>Store Location: {item.Location}</p>
                    </div> */}
                    {
                      item.AppId && item.AppId !== "" &&(
                      <div className="appid">
                    <p style={{
                        userSelect: item.LastestReportUpdateTime === null ? "text" : "none"
                    }}>Online Report App ID: {item.AppId}</p>
                    </div>
                    )
                    }
                    {
                      item.StoreOnlineOrderAppId && item.StoreOnlineOrderAppId !== "" && (
                        <>
                          <div className="OnlineOrderAppid">
                            <p style={{
                                userSelect: item.StoreSid === null ? "text" : "None"
                            }}>QR Order App ID: {item.StoreOnlineOrderAppId}</p>
                          </div>

                          


                          {/* <div className="StripeKey">
                            <p style={{
                                userSelect: item.StoreSid === null ? "text" : "none"
                            }}>Stripe Key: {item.StripePrivateKey ? '****' : 'None'}</p>
                          </div>
                          <div className="StripeWebhookKey">
                            <p style={{
                                userSelect: item.StoreSid === null ? "text" : "none"
                            }}>Stripe Webhook Key: {item.StripeWebhookKey ? '****' : 'None'}</p>
                          </div>
                          <div className="StoreUrl">
                            <p style={{
                                userSelect: item.StoreSid === null ? "text" : "None"
                            }}>QR Order Url: {item.StoreUrl}</p>
                          </div>

                          <div className="StoreLocation">
                            <p style={{
                                userSelect: item.StoreSid === null ? "text" : "None"
                            }}>Store Latitude and Longitude: ({item.StoreLatitude}, {item.StoreLongitude})</p>
                          </div>
                          <div className="StoreLocationRange">
                            <p style={{
                                userSelect: item.StoreSid === null ? "text" : "None"
                            }}>Store Location Range:{item.StoreLocationRange}m</p>
                          </div> */}
                        </>
                      )
                    }

                    

                  
                    {
                      item.AppId && item.AppId !== "" &&(
                    <div className="last-update">
                    <p>
                      Last Report Upload: {moment(item.LastestReportUpdateTime).format('YYYY-MM-DD HH:mm')}
                      </p>
                    </div>
                    )
                  }
                   
                  </div>
                  <p>
                    {item.ReportFunction === 1 && (
                      <>
                        Online Report Expired Date:{" "}
                        <span className={`date ${status === "expired" ? "expired" : ""} ${status === "active" ? "active" : ""} ${status === "almost_expired" ? "almost_expired" : ""}`}>
                          {moment.utc(item.ReportLicenseExpire).local().format("DD/MM/YYYY")}
                        </span>
                      </>
                    )}
                  </p>

                <p>
                  {item.OnlineOrderFunction === 1 && (
                    <>
                      QR Order Expired Date:{" "}
                      <span className={`date ${QRstatus === "expired" ? "expired" : ""} ${QRstatus === "active" ? "active" : ""} ${QRstatus === "almost_expired" ? "almost_expired" : ""}`}>
                        {moment.utc(item.QROrderLicenseExpire).local().format("DD/MM/YYYY")}
                      </span>
                    </>
                  )}
                </p>
                {
                      item.AppId && item.AppId !== "" &&(
                  <div className="customer-list">
                  <h3>Online Report Customers:</h3>
                  {
                      customerStoreMap[item.StoreId] ?
                      customerStoreMap[item.StoreId].map((customer, index) => (
                          <div key={index}>
                              <p>{customer.email}</p>
                          </div>
                      )) : <p>No customers linked.</p>
                  }
                  </div>
                  )}
                
              </div>
            
                <div className="store-buttons">
                {item.ReportFunction === 0 && (
                  <button className="edit-button-report" onClick={() => handleActivateReportClick(item.StoreId)}>
                    Active Online Report
                  </button>
                )}
                 {item.OnlineOrderFunction === 0 && item.PosVersion === 1 && (
                    <button className="edit-button-qr" onClick={() => handleActivateQROrderClick(item.StoreId)}>
                      Activate QR Order
                    </button>
                  )}
                  <button className="edit-button" onClick={() => handleEdit(item.StoreId)}>Edit</button>
          
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
