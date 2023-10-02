import React, {useState} from 'react';
import styles from './GuestSidebar.module.css';
import axios from 'axios';
// import { useHistory } from 'react-router-dom';
import {useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Sidebarnew = ({ user, onLogout, showSidebar, setShowSidebar, hasBranch, isChangePasswordModalOpen, setIsChangePasswordModalOpen,}) => {
  const counter = 6;
  const location = useLocation();
  const navigate = useNavigate();


  

  
  // 使用React状态来控制侧边栏是否显示
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const handleLogout = () => {
    onLogout();
  };

  const handleSelectBranch = async () => {
    const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token

    
    const response = await axios.post(
      process.env.REACT_APP_SERVER_URL + '/update-jwt', 
      {}, // 这里是你要发送的数据，如果没有，就留空对象
      {
        headers: {
          'authorization': `Bearer ${token}`
        },
        withCredentials: true
      }
    );
   
  
    if (response.status === 200 && response.data.newJwt) {
      sessionStorage.setItem('jwtToken', response.data.newJwt);
      navigate('/CheckStores');
      
    }
  };

  return (
    <aside style={{ display: showSidebar ? 'block' : 'none' }}>
      <div className={styles.top}>
        <div className={styles.logo}>
          <img src="./images/logo.png" alt="Logo" />
        </div>
        
        <div className={styles.close} id="close-btn" onClick={() => setShowSidebar(false)}>
          <span className="material-icons-sharp">close</span>
        </div>
      </div>
      <div className={styles.sidebar}>
        <a href="/dashboard" className={location.pathname === "/dashboard" ? styles.active : ""}>
        
          <span className="material-icons-sharp">grid_view</span>
          <h3>Dashboard</h3>
        </a>
        <a href="/sales-summary" className={location.pathname === "/sales-summary" ? styles.active : ""}>
          <span className="material-icons-sharp">insights</span>
          <h3>Analytics</h3>
        </a>
        <a href="#">
          <span className="material-icons-sharp">mail_outline</span>
          <h3>Messages</h3>
          <span className={styles['message-count']}>{counter}</span>
        </a>
        {/* <a href="https://buy.stripe.com/test_cN2g1C8113rZ9xKeUU">
          <span className="material-icons-sharp">shopping_cart</span>
          <h3>Renew Plan</h3>
        </a> */}
        <a onClick={() => setIsChangePasswordModalOpen(true)}>
          <span className="material-icons-sharp">vpn_key</span>
          <h3>Change Password</h3>
        </a>

        {hasBranch && (
        <a onClick={handleSelectBranch}>
          <span className="material-icons-sharp">view_cozy</span>
          <h3>Select Branch</h3>
        </a>
      )}
        <a href="#" onClick={handleLogout}>
          <span className="material-icons-sharp">logout</span>
          <h3>Logout</h3>
        </a>
     
      </div>
    </aside>
  );
};

export default Sidebarnew;
