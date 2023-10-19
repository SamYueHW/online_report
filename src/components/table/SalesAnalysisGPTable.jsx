import React from 'react';

const SalesAnalysisGPTable = ({ data }) => {
  const aggregatedData = {};
  const totalSalesPerDay = Array(7).fill(0);
  const totalGrossProfitPerDay = Array(7).fill(0);
  const departmentTotals = Array(7).fill(null).map(() => ({ sales: 0, gp: 0, cost: 0 }));
  let totalSalesPerWeek = 0;
  let totalGrossProfitPerWeek = 0;
  const daysWithData = Array(7).fill(false);

  // 扁平化和聚合数据
  data.forEach(week => {
    Object.values(week)[0].forEach(record => {
      const date = new Date(record.Date);
      const day = date.getUTCDay();
      const desc = record.Description;
      const gp = record.Cost ;  // 新添加的GP值

      if (!aggregatedData[desc]) {
        aggregatedData[desc] = Array(7).fill(null).map(() => ({ sales: 0, gp: 0, cost: 0 }));
      }

      aggregatedData[desc][day].sales += record.Amount;
      aggregatedData[desc][day].gp += (record.Amount - record.Cost);  // 计算毛利
      aggregatedData[desc][day].cost += gp;  // 新添加的GP值

      totalSalesPerDay[day] += record.Amount;
      totalGrossProfitPerDay[day] += (record.Amount - record.Cost);
      departmentTotals[day].sales += record.Amount;
      departmentTotals[day].gp += (record.Amount - record.Cost);
      departmentTotals[day].cost += gp;  // 新添加的GP值

      totalSalesPerWeek += record.Amount;
      totalGrossProfitPerWeek += (record.Amount - record.Cost);
      daysWithData[day] = true;
    });
  });

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totalRow = departmentTotals.reduce((acc, day) => {
    acc.sales += day.sales;
    acc.gp += day.gp;
    acc.cost += day.cost;
    return acc;
  }, { sales: 0, gp: 0, cost: 0 });

  const totalGPRate = totalRow.gp / totalRow.sales * 100;

  return (
    <table className="sales-analysis-gp-table">
      <thead>
        <tr>
          <th rowSpan="2" className="sticky-corner">Category</th>
          {dayNames.map((day, index) => daysWithData[index] && (
            <th colSpan="3" className="sticky-header-top" key={index}>{day}</th>
          ))}
          <th colSpan="3" className="sticky-header-top">Week Total</th>
        </tr>
        <tr>
          {daysWithData.map((hasData, index) => hasData && (
            <>
              <th className="sticky-header" key={`sales-${index}`}>Sales</th>
              <th className="sticky-header" key={`gp-${index}`}>G.P.</th>
              <th className="sticky-header" key={`cost-${index}`}>%</th>  {/* 新添加的 "GP" 列 */}
            </>
          ))}
          <th className="sticky-header">Sales</th>
          <th className="sticky-header">G.P.</th>  {/* 新添加的 "GP" 列 */}
          <th className="sticky-header">%</th>
          
        </tr>
      </thead>
      <tbody>
        {Object.keys(aggregatedData).map((desc, index) => {
          const weekTotalSales = aggregatedData[desc].reduce((acc, day) => {
            acc.sales += day.sales;
            acc.gp += day.gp;
            acc.cost += day.cost;  // 新添加的GP值
            return acc;
          }, { sales: 0, gp: 0, cost: 0 });
          const isEvenRow = index % 2 === 0;  // 计算这一行是否是偶数行
          const rowClass = isEvenRow ? 'even-row' : '';  // 根据是不是偶数行来选择CSS类名

          const weekGPRate = weekTotalSales.gp / weekTotalSales.sales * 100;

          return (
            <tr key={index} className={rowClass}>
              <td className="sticky-description">{desc}</td>
              {aggregatedData[desc].map((day, dayIndex) => daysWithData[dayIndex] && (
                <>
                  <td key={`sales-${dayIndex}`}>{day.sales.toFixed(2)}</td>
                  <td key={`cost-${dayIndex}`}>{day.cost.toFixed(2)}</td>  {/* 新添加的 "GP" 列 */}
                  <td key={`gp-${dayIndex}`}>{((day.gp / day.sales) * 100).toFixed(2)}%</td>
                </>
              ))}
              <td>{weekTotalSales.sales.toFixed(2)}</td>
              <td>{weekTotalSales.cost.toFixed(2)}</td>  {/* 新添加的 "GP" 列 */}
              <td>{weekGPRate.toFixed(2)}%</td>
             
            </tr>
            
          );
        })}
        <tr className = "sticky-row" style={{ fontWeight: 'bold' , fontSize:"15px"}}>
          <td className="sticky-corner-bottom">Totals:</td>
          {departmentTotals.map((day, dayIndex) => daysWithData[dayIndex] && (
            <>
              <td key={`total-sales-${dayIndex}`}>{day.sales.toFixed(2)}</td>
              <td key={`total-cost-${dayIndex}`}>{day.cost.toFixed(2)}</td>
              <td key={`total-gp-${dayIndex}`}>{((day.gp / day.sales) * 100).toFixed(2)}%</td>
            </>
          ))}
          <td>{totalRow.sales.toFixed(2)}</td>
          <td>{totalRow.cost.toFixed(2)}</td>
          <td>{totalGPRate.toFixed(2)}%</td>
        </tr>
      </tbody>
    </table>
  );
};

export default SalesAnalysisGPTable;
