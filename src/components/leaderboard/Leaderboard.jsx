import React from 'react';
import './leaderboard.scss';

const Leaderboard = ({ data }) => {

    const formattedData = [];
    // console.log(data);
    for (let i = 0; i < data.length; i += 3) {
      formattedData.push({
        name: data[i],
        qty: data[i + 1],
        totalSales: data[i + 2],
      });
    }
  
  return (
    <div className="leaderboard">
      <div className="item header">  
        <span>Rank</span>
        <span>Product Name</span>
        <span>Qty</span>
        <span>Total Sales</span>
      </div>
      {formattedData.map((item, index) => (
        <div key={index} className="item">
          <span className="rank">{index + 1}</span>
          <span className="name">{item.name}</span>
          <span className="qty">{item.qty}</span>
          <span className="sales">${item.totalSales}</span>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;

