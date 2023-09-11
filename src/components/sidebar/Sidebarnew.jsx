import React from 'react';
import styles from './GuestSidebar.module.css';
import { useLocation } from 'react-router-dom';

const Sidebarnew = ({ user, onLogout }) => {
  const counter = 6;
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
  };

  return (
    <aside>
      <div className={styles.top}>
        <div className={styles.logo}>
          <img src="./images/logo.png" alt="Logo" />
        </div>
        <div className={styles.close} id="close-btn">
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
        <a href="https://buy.stripe.com/test_cN2g1C8113rZ9xKeUU">
          <span className="material-icons-sharp">shopping_cart</span>
          <h3>Renew Plan</h3>
        </a>
        <a href="#" onClick={handleLogout}>
          <span className="material-icons-sharp">logout</span>
          <h3>Logout</h3>
        </a>
      </div>
    </aside>
  );
};

export default Sidebarnew;
