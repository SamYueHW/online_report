import React from 'react';
import './leaderboard.scss';

const Leaderboard = ({ data }) => {
  // 检查是否所有对象的字段都是 null
  const allNull = data.every(item => item.Description === null && item.Amount === null && item.Qty === null);

  if (allNull) {
    return <div className="leaderboard-empty">No data available</div>;
  }

  return (
    // <div className="leaderboard">
    //   <div className="item header">  
    //     <span className="rankitem">Rank</span>
    //     <span className="name">Product Name</span>
    //     <span className="qty">Qty</span>
    //     <span className="sales">Total Sales</span>
    //   </div>
    //   {data.map((item, index) => (
    //     <div key={index} className="item">
    //       <span className="rankitem">{index + 1}</span>
    //       <span className="name">{item.Description || 'N/A'}</span>
    //       <span className="qty"> {item.Qty ?
    //         (item.Qty % 1 === 0 ? item.Qty : item.Qty.toFixed(2))
    //         : '0.00'
    //       }</span>
    //       <span className="sales">${item.Amount ? item.Amount.toFixed(2) : '0.00'}</span>
    //     </div>
    //   ))}
    // </div>
    <div className="leaderboard">
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Product Name</th>
          <th>Qty</th>
          <th>Total Sales</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{item.Description || 'N/A'}</td>
            <td>
              {item.Qty ?
                (item.Qty % 1 === 0 ? item.Qty : item.Qty.toFixed(2))
                : '0.00'
              }
            </td>
            <td>${item.Amount ? item.Amount.toFixed(2) : '0.00'}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
};

export default Leaderboard;
