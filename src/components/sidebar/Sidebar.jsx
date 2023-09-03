
// import './sidebar.scss'
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import LocalOfferIcon from '@mui/icons-material/LocalOffer';
// import { Link } from "react-router-dom";

// import React, { useState, useEffect } from 'react';




// const Sidebar = ({ user, onLogout,isOpen,onToggle  }) => {

//   const handleSidebarToggle = () => {
//     onToggle();
//   };

//   useEffect(() => {
//     if (isOpen) {
//       document.querySelector(".sidebar").classList.remove("close");
//     } else {
//       document.querySelector(".sidebar").classList.add("close");
//     }
//   }, [isOpen]);

//   const handleLogout = () => {
//     // 调用 Dashboard 中的 log out 逻辑
//     onLogout();
//   };
//   const handleArrowClick = (e) => {
//     e.stopPropagation(); // Prevent event from bubbling up
    
//     let arrowParent = e.target.parentElement.parentElement;
//     arrowParent.classList.toggle("showMenu");
//   };
//   const handleSubMenuClick = (e) => {
//     e.stopPropagation(); // 阻止事件冒泡
//     // 处理子菜单项的导航逻辑
//   };
//   const counter = 1;
 

//   return (
//     <div className="sidebar close"onClick={handleSidebarToggle}>
//       <div className="logo-details">
//         <i className="bx bx-menu" ></i>
//         <span className="logo_name">Online Report</span>
//       </div>

//       <ul className="nav-links">
//         <li>
//           <a href="#">
//             <i className="bx bx-home"></i>
//             <span className="link_name">Dashboard</span>
//           </a>
//         </li>

//         <li>
//           <div className="icon-link sales"  onClick={handleArrowClick}>
//             <a href="#">
//               <i className="bx bx-collection"></i>
//               <span className="link_name">Sales</span>
//             </a>
//             <i className="bx bx-chevron-down arrow" ></i>
//           </div>
//           <ul className="sub-menu">
//             <li><a className="link_name" href="#" onClick={handleSubMenuClick}>Sales</a></li>
//             <li><a href="#" onClick={handleSubMenuClick}>Sales1</a></li>
//             <li><a href="#" onClick={handleSubMenuClick}>Sales2</a></li>
//           </ul>
//         </li>
//         <li>
//           <div className="icon-link renew-plan"  onClick={handleArrowClick}>
//             <a href="https://buy.stripe.com/test_cN2g1C8113rZ9xKeUU">
//             <i className="bx bx-refresh"></i>
//               <span className="link_name">Renew Plan</span>
//             </a>
//             {/* <i className="bx bx-chevron-down arrow" ></i> */}
//           </div>
//           <ul className="sub-menu">
//             <li><a className="link_name" href="https://buy.stripe.com/test_cN2g1C8113rZ9xKeUU" onClick={handleSubMenuClick}>Renew Plan</a></li>
           
//           </ul>
//         </li>

//         <li>
//           <div className="icon-link inbox"  onClick={handleArrowClick}>
//             <a href="#">
//             <i className="bx bxs-bell"> <div className="counter_number">{counter}</div></i>
//               <span className="link_name">Inbox </span>
//             </a>
//             {/* <i className="bx bx-chevron-down arrow" ></i> */}
//           </div>
//           <ul className="sub-menu inbox">
//             <li>
//               <a className="link_name" href="https://buy.stripe.com/test_cN2g1C8113rZ9xKeUU" onClick={handleSubMenuClick}>
//                 Inbox
//               </a>
//             </li>
//           </ul>
//         </li>

//         <li>
//     <div className="profile-details">
//       <div className="profile-content">
        
//         <img src="/images/faviconV2 (1).png" alt="profileImg"/>
//       </div>
//       <div className="name-job">
//         <div className="profile_name">{user}</div>
//         <div className="job">Web Desginer</div>
//       </div>
//       <i className="bx bx-log-out" onClick={handleLogout}></i>
//     </div>
//   </li>
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;
