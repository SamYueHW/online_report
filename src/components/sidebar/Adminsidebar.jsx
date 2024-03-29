
import './sidebar.scss'
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { Link } from "react-router-dom";

import React, { useState, useEffect } from 'react';


const Sidebar = ({ user, onLogout,isOpen,onToggle  }) => {

  const handleSidebarToggle = () => {
    onToggle();
  };

  useEffect(() => {
    if (isOpen) {
      document.querySelector(".sidebar").classList.remove("close");
    } else {
      document.querySelector(".sidebar").classList.add("close");
    }
  }, [isOpen]);

  const handleLogout = () => {
    // 调用 Dashboard 中的 log out 逻辑
    onLogout();
  };

  const handleArrowClick = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    let arrowParent = e.target.parentElement.parentElement;
    arrowParent.classList.toggle("showMenu");
  };
  const handleSubMenuClick = (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    // 处理子菜单项的导航逻辑
  };
  const counter = 1;
 

  return (
    <div className="sidebar close"onClick={handleSidebarToggle}>
      <div className="logo-details">
        <i className="bx bx-menu" ></i>
        <span className="logo_name">ADMIN</span>
      </div>

      <ul className="nav-links">
        <li>
          <a href="/admin-dashboard">
            <i className="bx bx-home"></i>
            <span className="link_name">Online Report</span>
          </a>
        </li>

        <li>
          <a href="/member-store">
            <i className="bx bx-home"></i>
            <span className="link_name">Store CRM</span>
          </a>
        </li>


        {/* <li>
          <div className="icon-link online-report"  onClick={handleArrowClick}>
            <a href="/notification-list" onClick={handleArrowClick}>
              <i className="bx bx-collection"></i>
              <span className="link_name">Notifications</span>
            </a>
            <i className="bx bx-chevron-down arrow" ></i>
          </div>
          <ul className="sub-menu">
            <li><a className="link_name" href="/notification-list" onClick={handleSubMenuClick}>Notifications</a></li>
            
            <li><a href="/notification-setup" onClick={handleSubMenuClick}>Notification setup</a></li>
          </ul>
        </li> */}
        
        <li>
    <div className="profile-details">
      <div className="profile-content">
        
        <img src="/images/faviconV2 (1).png" alt="profileImg"/>
      </div>
      <div className="name-job">
        <div className="profile_name">{user}</div>
        <div className="job">
  {user === "admin@lotus.com.au" ? "Admin-Melb" : 
   user === "admin@i-pos.com.au" ? "Admin-Syd" : 
   user === "admin@appliedtechs.com.au" ? "Admin-Qld" : 
   user === "admin@enrich.com.au" ? "Admin-Charles" : "Admin"}
</div>

      </div>
      <i className="bx bx-log-out" onClick={handleLogout}></i>
    </div>
  </li>
      </ul>
    </div>
  );
};

export default Sidebar;

