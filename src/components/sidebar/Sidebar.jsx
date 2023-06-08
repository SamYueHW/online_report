import React from 'react'
import './sidebar.scss'
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { Link } from "react-router-dom";
const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className='top'>
      <Link to="/dashboard" style={{ textDecoration: "none" }}>
          <span className="logo">Online Report</span>
        </Link>
      </div>
      <hr/>
      <div className='bottom'>
       <ul>
          <p className='title'>Main</p>
          <li>
              <DashboardIcon className="icon" />
              <span>Dashboard</span>
          </li>
          <p className="title">Charts</p>
          <Link to="/sales" style={{ textDecoration: "none" }}>
            <li>
                <LocalOfferIcon className="icon" />
                <span>Sales Report</span>
            </li>
          </Link>
       </ul>
      </div>
    </div>
  )
}

export default Sidebar
