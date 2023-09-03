import React from "react";
import { Link } from "react-router-dom";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import "./widget.scss";

const Widget = ({ type, data }) => {
 
  // temp
  let amount = data;
  
  let diff = 30;

  if (Array.isArray(data)) {
    amount = data[0];
    diff = -(((data[1] - data[0]) / data[0]) * 100).toFixed(1);
    
  } else {
    // 处理只有一个数据的情况
    amount = data;
    
  }
  
  switch (type) {
    case "order":
      data = {
        title: "ORDERS",
        isMoney: false,
        icon: (
          <ShoppingCartOutlinedIcon
            className="icon"
            style={{ color: "goldenrod", backgroundColor: "#daa52033" }}
          />
        ),
      };
      break;
    case "earnings":
      data = {
        title: "Today EARNINGS",
        isMoney: true,
        link: "View More payment methods",
        
        icon1: (
          <MonetizationOnOutlinedIcon
            className="icon"
            style={{ color: "green", backgroundColor: "#00800033" }}
          />
        ),
        icon2: (
          <PaymentIcon
            className="bank-icon"
            style={{ color: "green", backgroundColor: "#00800033" }}
          />
        ),
      };
      break;
    case "month_earnings":
      data = {
        title: "MONTH EARNINGS",
        isMoney: true,
        link: "View More Earnings",
        icon: (
          <AccountBalanceWalletOutlinedIcon
            className="icon"
            style={{ color: "purple", backgroundColor: "#80008033" }}
          />
        ),
      };
      break;

    default:
      break;
  }

  return (
    <div className={`widget ${type}-widget`}>
      <div className="left">
        <div className="top">
          <span className="title">{data.title}</span>
        </div>
        <div className="bottom">
          <span className="counter">
            {data.isMoney && "$"} {amount}
          </span>
          
        </div>
      </div>
      <div className="right">
      {type === "month_earnings" && (
        <>
          <div className="percentage positive">
            <KeyboardArrowUpIcon />
            {diff}%
          </div>
          {data.link && (
            <span className="link">
              <Link to="/salesCharts" className="link-style">
                {data.link}
              </Link>
            </span>
          )}
        </>
      )}
      {type === "earnings" && (
        <>
        <div className="payment">
          {data.icon1 && (
            <div className="icon-text">
              <MonetizationOnOutlinedIcon
                className="icon"
                style={{
                  color: "green",
                  backgroundColor: "#00800033",
                  fontSize: "2vw",
                  padding: "0.4vw"
                  
                }}
              />
              <span className="icon-text-label">Cash</span>
            </div>
          )}
          {data.icon2 && (
            <div className="icon-text">
              <PaymentIcon 
               className="icon"
               style={{
                 color: "purple",
                 backgroundColor: "#80008033",
                 fontSize: "2vw",
                 padding: "0.4vw"
                 
               }}/>
              <span className="icon-text-label">Other payment</span>
            </div>
          )}
        </div>
        {data.link && (
          <span className="link">
            <Link to="/payment-summary" className="link-style">
              {data.link}
            </Link>
          </span>
        )}

        </>
      )}
      {type === "order" && data.icon }

    </div>
    </div>
  );
  
  
};

export default Widget;
