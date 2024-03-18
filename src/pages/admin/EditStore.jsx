import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useGetState } from 'ahooks';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Modal, Button, Input, notification, Alert, Divider } from 'antd';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './editStore.scss'; // Import the CSS file for EditStore component

import Adminsidebar from "../../components/sidebar/Adminsidebar";


const EditStore = () => {
  const navigate = useNavigate();
  let query = new URLSearchParams(useLocation().search);
  let storeId = query.get('store');

  const [emailError, setEmailError] = useState('');

  const [storeData, setStoreData, getStoreData] = useGetState(null);
  const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
  const [isAdmin, setIsAdmin, getIsAdmin] = useGetState(false);
  const [relatedUserData, setRelatedUserData, getRelatedUserData] = useGetState(null);
  const [allUserData, setAllUserData, getAllUserData] = useGetState(null);
  const [storeID, setStoreID] = useState(null);
  const [formData, setFormData] = useState({
    rExpiredDate: null,
    storeName: null, 
    

    QrExpiredDate: null,
    StripePrivateKey: null,
    StripeWebhookKey: null,
    StoreUrl: null,
    StoreLatitude: null,
    StoreLongitude: null,
    StoreLocationRange: null,


  });

  const [user, setUser, getUser] = useGetState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedUser, setSelectedUser, getSelectedUser] = useGetState(null);
const [searchTerm, setSearchTerm] = useState('');

// 模糊搜索电子邮件
const filteredUsers = allUserData ? allUserData.filter(user => 
  user.email.toLowerCase().includes(searchTerm.toLowerCase())
) : [];

const handleModalOpen = () => {
  setIsModalOpen(true);
};

const handleModalClose = () => {
  setIsModalOpen(false);
};

const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [customer, setCustomer] = useState({ email: '', password: '' });
  const [isEditing, setIsEditing] = useState(false);

  const openCustomerModal = async () => {
    setCustomerModalVisible(true);
    try {
      //获取jwtToken
      const token = sessionStorage.getItem('jwtToken');
      const config = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };

      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/getQRCustomer`, { storeId }, config);
      
      if (response.data.results) {
        setCustomer({ email: response.data.results.Email, password: '', CusId: response.data.results.Id });
        setIsEditing(false);
      } else {
        setCustomer({ email: '', password: '' });
        setIsEditing(true); // 如果没有客户信息，直接进入编辑模式
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const isValidEmail = (email) => {
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 45;
  };
  
  const handleCustomerSave = async () => {
    try {
      if (!isValidEmail(customer.email)) {
        setEmailError("Invalid email format or length exceeds 45 characters");
        return;
      }

      if (customer.password.length === 0) {
        setCustomerModalVisible(false);
        return;
      }
      setEmailError(''); 
      const token = sessionStorage.getItem('jwtToken');
      const config = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/updateQRCustomer`,{ storeId, customer },config);

      if (response.status === 200) {
        notification.success({ message: 'Customer created successfully' });
      } 
      else if(response.status === 201){
        notification.success({ message: 'Customer updated successfully' });
      }
      else {
        notification.error({ message: 'Failed to update customer' });
      }
    } catch (error) {
      notification.error({ message: 'Error updating customer' });
    }
    setCustomerModalVisible(false);
  };



const handleUserSelect = (user) => {
  setSelectedUser(user);
};
useEffect(() => {
  if (filteredUsers.length === 1) {
    setSelectedUser(filteredUsers[0]);
  }
}, [filteredUsers]);


const handleModalSubmit = async () => {
  // 发送请求到服务器，包含选定的 userId 和 storeId
  // 这里假设 selectedUser 包含用户的 ID
  const userId = getSelectedUser() ? getSelectedUser().cus_id : null;
  if (userId) {
    const response = await axios.post(process.env.REACT_APP_SERVER_URL + '/allocateUser', {
      userId,
      storeId
    });
    if (response.status === 200) {
      // 更新相关用户数据
      alert("Add user successfully");
      const response = await axios.get(process.env.REACT_APP_SERVER_URL+`/store/${storeId}`);
      setStoreData(response.data.storeData);
             
      setRelatedUserData(response.data.userData);
    }
    else{
      alert("Add user failed");
    }
  }
  setIsModalOpen(false);
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
  if(storeId){
  setStoreID(storeId);

  }
  
}, [storeId]);
  

  useEffect(() => {
    const checkAccount = async () => {
      try {
        const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
        const config = {
          headers: {
            authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(process.env.REACT_APP_SERVER_URL+'/checkAccount', { ...config, withCredentials: true });
        if (response.data.success) {
          const fetchStoreData = async () => {
            try {
              const response = await axios.get(process.env.REACT_APP_SERVER_URL+`/store/${storeId}`);
        
              
              setStoreData(response.data.storeData);
             
              setRelatedUserData(response.data.userData);
              setFormData({
                rExpiredDate: response.data.storeData.ReportLicenseExpire ? new Date(response.data.storeData.ReportLicenseExpire) : getYesterdayDate(),
                storeName: response.data.storeData.StoreName,
               
                QrExpiredDate: response.data.storeData.QROrderLicenseExpire ? new Date(response.data.storeData.QROrderLicenseExpire) : getYesterdayDate(),
                StripePrivateKey: response.data.storeData.StripePrivateKey ? "***" :"",
                StripeWebhookKey: response.data.storeData.StripeWebhookKey ? "***" : "",
                StoreUrl: response.data.storeData.StoreUrl,
                StoreLatitude: response.data.storeData.StoreLatitude,
                StoreLongitude: response.data.storeData.StoreLongitude,
                StoreLocationRange: response.data.storeData.StoreLocationRange,


                // 设置其他输入字段的初始值
              });
              setIsLoading(false);
              setIsAdmin(true);
              setAllUserData(response.data.allUsers);
              
            } catch (error) {
              console.log(error);
              navigate('/admin-dashboard');
            }
          };

          fetchStoreData();}
        else{
            navigate('/');
        }
      } catch (error) {
        console.log(error);
        navigate('/');
      }
    };
    if(storeId){
      checkAccount();
    }
  }, [storeId]);

  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  };

  const handleDateChange = (date) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      rExpiredDate: date,
    }));
  };
  const handleQRDateChange = (date) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      QrExpiredDate: date,
    }));
  };

  const handleDeleteQRCustomer = async () => {
    // 弹出确认对话框
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this user?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const userId = customer.CusId;
          // 获取jwtToken
          const token = sessionStorage.getItem('jwtToken');
          const config = {
            headers: {
              'authorization': `Bearer ${token}`
            }
          };
          const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/deleteQRUser/${userId}`, config);
          if (response.status === 200) {
            // 用户删除成功后的逻辑
            notification.success({ message: 'User deleted successfully' });
            setCustomer({ email: '', password: '' });
            setIsEditing(true);
          } else {
            // 用户删除失败后的逻辑
            notification.error({ message: 'Failed to delete user' });
          }
        } catch (error) {
          console.error("Error deleting user:", error);
        }
      },
    });
  };
  

  const handleDeleteUser = async (userId,storeId) => {
    try {
      await axios.delete(process.env.REACT_APP_SERVER_URL + '/user/' + userId + '/' + storeId);
      const response = await axios.get(process.env.REACT_APP_SERVER_URL+`/store/${storeId}`);
      setStoreData(response.data.storeData);
      setRelatedUserData(response.data.userData);
      // 执行其他逻辑
    } catch (error) {
      console.log(error);
      // 处理删除用户失败的逻辑
    }
  };
  const handleQRCodeGenerator = async () => {
  
    
    navigate(`/qr-order-generator/${storeID}`);

  };
  const customerStoreLogin = async () => {
    const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
    const config = {
      headers: {
        'authorization': `Bearer ${token}`
      }
    };
   
    const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/qrAdminLogin`, { storeId }, config);
    if (response.status === 200) {
      const token = response.data.jwt;
      //new page
      window.open(`${process.env.REACT_APP_FONT_QR_URL}/adminEnrich/${storeId}/${token}`);
      // window.location.href = `${process.env.REACT_APP_FONT_QR_URL}/adminEnrich/${storeId}/${token}`;
  };
  };
  const handleDelete = async (storeId, linkedCustomers) => {

    if (linkedCustomers && linkedCustomers.length > 0) {
      const isConfirmed = window.confirm("There are customers linked to this store. Are you sure you want to disable Online Report function?");
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
      const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/deleteOnlineReport/${storeId}`, config);
      
      if (response.status === 200) {
        alert('Online Report Function has been disabled successfully.');
        setStoreData((prevFormData) => ({
          ...prevFormData,
          AppId: '',
        }));

      }else if(response.status === 201){
        navigate('/admin-dashboard');

      } else {
        alert('Failed to disable Online Report Function.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to disable Online Report Function.');
    }
  };
  const handleDeleteQR = async (storeId) => {
    try {
      const isConfirmed = window.confirm("Are you sure you want to disable QR Order function?");
      if (!isConfirmed) {
        return;
      }
      const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
      const config = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/deleteQR/${storeId}`, config);
     
      if (response.status === 200) {
        alert('QR Order Function has been disabled successfully.');
        setStoreData((prevFormData) => ({
          ...prevFormData,
          StoreOnlineOrderAppId: '',
        }));
      } else if(response.status === 201){
        navigate('/admin-dashboard');

      } else {
        alert('Failed to disable QR Order Function.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to disable QR Order Function.');
    }
  };

  const handleSubmit = async () => {
 
    try {
      
      const date = new Date(formData.rExpiredDate);
      const formattedDate = date.toLocaleDateString('en-AU');
  
      axios.put(process.env.REACT_APP_SERVER_URL+`/store/${storeId}`, {
        rExpiredDate: formattedDate,
        storeName: formData.storeName,
        

        QrExpiredDate: formData.QrExpiredDate,
        StripePrivateKey: formData.StripePrivateKey,
        StripeWebhookKey: formData.StripeWebhookKey,
        StoreUrl: formData.StoreUrl,
        StoreLatitude: formData.StoreLatitude,
        StoreLongitude: formData.StoreLongitude,
        StoreLocationRange: formData.StoreLocationRange,


        // 添加其他需要更新的字段
      }).then(response => {
        if (response.status === 200) {
          alert("Update successfully");
          navigate('/admin-dashboard');
         
        } else {
          alert("Update failed"); // 一般来说，这里不会执行，因为非 200 的状态通常会触发 .catch() 块
        }
      }).catch(error => {
        alert("Update failed"); // 处理失败情况
        console.log(error);
      });
  
      
    } catch (error) {
      console.log(error);
      // 更新失败后的处理逻辑
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
  

  if (getIsLoading()) {
    return <div>Loading...</div>;
  }
  else if (!getIsLoading() && getIsAdmin() ) {
  return (
    <div>
      <Adminsidebar user={getUser()} onLogout={handleLogout} isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <main className='store-setup'>
      <h1>Edit Store</h1>
      <p>Store ID: {storeData.StoreId}</p>
      <label>
          Store Name: <input className="search-input"
            type="text" 
            value={formData.storeName} 
            onChange={(e) => setFormData({...formData, storeName: e.target.value})}
          />
      </label>
      <div className="content-wrapper">
       
          {storeData && storeData.AppId && (
             <div className="online-report-section"> 
             
              <form className="edit-report-form" >
              <h2>Online Report</h2>
              <div className='report-edit-section'>
                <div style={{marginTop:'5px'}}>
                  <p>Online Report App ID: {storeData.AppId}</p>
                </div>
                <div className='form-row'>
                  <label>
                    Report Expired Date:{' '}
                    <DatePicker
                      className="date-picker"
                      selected={formData.rExpiredDate}
                      onChange={handleDateChange}
                      placeholderText="Select a date"
                      dateFormat="dd/MM/yyyy" // 设置日期格式为澳大利亚格式，例如：31/12/2023
                    />
                  </label>
                
                  {/* <label >
                    POS Version: <select className="user-select" style = {{appearance: "auto"}}
                      value={formData.posVersion === 0 ? 'Retail' : 'Hospitality'} 
                      onChange={(e) => setFormData({...formData, posVersion: e.target.value === 'Retail' ? 0 : 1})}
                    >
                      <option value="Retail">Retail</option>
                      <option value="Hospitality">Hospitality</option>
                    </select>
                  </label> */}
              </div>

                </div>
             
               
              </form>
            
          
         
                <div className="related-users">
                  <div style={{fontSize:'19px', fontWeight:'bold', color:'#363949'}}>Related Users:</div>
                  <button className="delete-button" onClick={handleModalOpen}>Add</button>
                  {relatedUserData && relatedUserData.map((user) => (
                    <div className="user-box" key={user.cus_id}>
                      <div className="user-info">
                        <p className="user-id">{`User ID: ${user.cus_id}`}</p>
                        <p className="user-email">{`Email: ${user.email}`}</p>
                      </div>
                      <button className="delete-button" onClick={() => handleDeleteUser(user.cus_id,storeData.StoreId)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
               
                <button className="delete-onlineReport-button" onClick={() => handleDelete(storeData.StoreId, relatedUserData)}>Delete</button>
              
          </div>
          )}
        
        
          {storeData && storeData.StoreOnlineOrderAppId && (
          <div className="qr-order-section">
          <form className="edit-report-form">
          <h2>QR Order</h2>
          {/* <button className='qr-button' onClick={() => handleQRCodeGenerator()}>Generate QR Code</button> */}
          <div className="qr-button-section">
          <Button className="qr-button_custom" onClick={() => handleQRCodeGenerator()}>Generate QR Code</Button>
          <Button className="customer-button" onClick={openCustomerModal}>Admin Account</Button>
          <Button className="customer-button" onClick={() => customerStoreLogin()}>Customer Store</Button>
          </div>

      <Modal
        title={isEditing ? "Register Admin Account" : "Edit Admin Account"}
        open={customerModalVisible}
        onOk={handleCustomerSave}
        onCancel={() => {
          setCustomerModalVisible(false);
          setEmailError(''); // 清除电子邮件错误信息
        }}
      >
  <div className="modal-input-section">
  {emailError && <Alert message={emailError} type="error" />}
  <div className="input-wrapper">
      <label>Admin Email:</label>
      <Input 
        className="input-field"
        placeholder="Email"
        value={customer.email}
        onChange={(e) => setCustomer({...customer, email: e.target.value})}
        disabled={!isEditing}
      />
    </div>
    
    <div className="input-wrapper">
    <label>{!isEditing ? "Reset Password:" : "Password:"}</label>
      <Input
        className="input-field"
        placeholder="Password"
        type="password"
        value={customer.password}
        onChange={(e) => setCustomer({...customer, password: e.target.value})}
      />
    </div>
  </div>
    {!isEditing && <Button 
      type="primary" 
      danger
      onClick={handleDeleteQRCustomer}
    >
      Delete Account
    </Button>}

    <Divider />
    {/* <div className='input-wrapper'>
     
      <label>Manager Email:</label>
      <Input 
        className="input-field"
        placeholder="Email"
        value={customer.email}
        onChange={(e) => setCustomer({...customer, email: e.target.value})}
        disabled={!isEditing}
      />
    </div> */}
          </Modal>
            <div className='qr-edit-section'>
           
            <div style={{marginTop:'5px'}}><p>QR Order App ID: {storeData.StoreOnlineOrderAppId}</p></div>
              <div className="form-row">
                <label>
                      QR Order Expired Date:{' '}
                      <DatePicker
                        className="date-picker"
                        selected={formData.QrExpiredDate}
                        onChange={handleQRDateChange}
                        placeholderText="Select a date"
                        dateFormat="dd/MM/yyyy" // 设置日期格式为澳大利亚格式，例如：31/12/2023
                      />
                </label>
              </div >
              <div className="form-row">
                <label>
                    Stripe Key:  <input className="search-input"
                    type="text" 
                    value={formData.StripePrivateKey}
                  
                    onChange={(e) => setFormData({...formData, StripePrivateKey: e.target.value})}
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                    Stripe Webhook Key:  <input className="search-input"
                    type="text"
                    value={formData.StripeWebhookKey}
                    onChange={(e) => setFormData({...formData, StripeWebhookKey: e.target.value})}
                  />
                </label>
              </div> 
              <div className="form-row">  
                <label>
                    QR Order Url:  <input className="search-input"
                    type="text"
                    value={formData.StoreUrl}
                    onChange={(e) => setFormData({...formData, StoreUrl: e.target.value})}
                  />
                </label>
              </div>
              <div className='special-row' style={{display:'flex', gap:'16px' }}>
                <label>
                    Store Latitude:  <input className="search-input"
                    type="number"
                    value={formData.StoreLatitude}
                    onChange={(e) => setFormData({...formData, StoreLatitude: e.target.value})}
                  />
                </label>

                <label>
                    Store Longitude:  <input className="search-input"
                    type="number"
                    value={formData.StoreLongitude}
                    onChange={(e) => setFormData({...formData, StoreLongitude: e.target.value})}
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                    Store Range (meters):  <input className="search-input"
                    type="number"
                    value={formData.StoreLocationRange}
                    onChange={(e) => setFormData({...formData, StoreLocationRange: e.target.value})}
                  />
                </label>
              </div>
              <button className="delete-onlineReport-button" onClick={() => handleDeleteQR(storeData.StoreId)}>Delete</button>
              

            </div>
          </form>
          </div>
          )}
        
      </div>
      <button className = "edit-store-submit-button" type="submit" onClick={()=>handleSubmit() }>Submit</button>
      </main>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add User</h2>
            <input 
              className="search-input"
              type="text" 
              placeholder="Search email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
          className="user-select" 
          style={{appearance: "auto"}}
          onChange={(e) => handleUserSelect(JSON.parse(e.target.value))}
        >
          {filteredUsers.map(user => (
            <option key={user.cus_id} value={JSON.stringify(user)}>
              {user.email}
            </option>
          ))}
        </select>

        <p>Selected User: {getSelectedUser() ? getSelectedUser().email : 'None'}</p>
            <button className = "commonbtn" onClick={handleModalSubmit}>Submit</button>
            <button className = "commonbtn" onClick={handleModalClose}>Close</button>
          </div>
        </div>
      )}
    </div>
    
  );

}
  
};

export default EditStore;
