import React from 'react';
import './leaderboard.scss';

const Leaderboard = ({ data,showRank }) => {

  // 检查是否所有对象的字段都是 null
  const allNull = data.every(item => item.Description === null && item.Amount === null && item.Qty === null);

  if (allNull) {
    return <div className="leaderboard-empty">No data available</div>;
  }

  return (
  
    <div className="leaderboard">
    <table>
      <thead>
        <tr>
        <th>Rank</th>
        <th>{showRank ? 'Product Name' : 'Group Name'}</th>
          <th>Qty</th>
          <th>Total Sales</th>
        </tr>
      </thead>
      <tbody>
        {data.filter(item => item.Amount !== 0).map((item, index) => (
          <tr key={index}>
           <td>{index + 1}</td>
            <td>{item.Description || item.ItemGroup || 'N/A'}</td>
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
