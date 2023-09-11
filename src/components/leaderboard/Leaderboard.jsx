import React from 'react';
import './leaderboard.scss';

const Leaderboard = ({ data }) => {
  // 假设data是你提供的对象数组
  
  return (
    <div className="leaderboard">
      <div className="item header">  
        <span>Rank</span>
        <span>Product Name</span>
        <span>Qty</span>
        <span>Total Sales</span>
      </div>
      {data.map((item, index) => (
        <div key={index} className="item">
          <span className="rankitem">{index + 1}</span>
          <span className="name">{item.Description}</span>
          <span className="qty">{item.Qty}</span>
          <span className="sales">${item.Amount.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;
