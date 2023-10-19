import React from 'react';

const SalesAnalysisTable = ({ data, totalNetSales }) => {


  const aggregatedData = {};
  const totalSalesPerDay = Array(7).fill(0);
  const departmentTotals = Array(7).fill(null).map(() => ({ sales: 0, units: 0 }));
  let totalSalesPerWeek = 0;
  const daysWithData = Array(7).fill(false);
    const totalNetSalesPerDay = Array(7).fill(0);

    // 填充totalNetSalesPerDay数组
  totalNetSales.forEach(week => {
    Object.values(week)[0].forEach(record => {
        const date = new Date(record.Date);
        const day = date.getUTCDay();
        totalNetSalesPerDay[day] += record.TotalSales;
    });
    });
  
  // 扁平化和聚合数据
  data.forEach(week => {
    Object.values(week)[0].forEach(record => {
      const date = new Date(record.Date);
      const day = date.getUTCDay();
      const desc = record.Description;

      if (!aggregatedData[desc]) {
        aggregatedData[desc] = Array(7).fill(null).map(() => ({ sales: 0, units: 0 }));
      }

      aggregatedData[desc][day].sales += record.Amount;
      aggregatedData[desc][day].units += record.Qty;
      totalSalesPerDay[day] += record.Amount;
      departmentTotals[day].sales += record.Amount;
      departmentTotals[day].units += record.Qty;
      totalSalesPerWeek += record.Amount;
      daysWithData[day] = true;
    });
  });


  const departmentWeekTotal = departmentTotals.reduce((acc, day) => {
    acc.sales += day.sales;
    acc.units += day.units;
    return acc;
  }, { sales: 0, units: 0 });
  const dailyAdjustments = Array(7).fill(0);

  for (let i = 0; i < 7; i++) {
    dailyAdjustments[i] = departmentTotals[i].sales - totalNetSalesPerDay[i];
  }
  
  // 计算一周内的Total Net Sales
const totalNetSalesForWeek = totalNetSalesPerDay.reduce((acc, val) => acc + val, 0);

// 计算一周内的Adjustments
const totalAdjustmentsForWeek = dailyAdjustments.reduce((acc, val) => acc + val, 0);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <table className="sales-analysis-table">
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
              <th className="sticky-header" key={`units-${index}`}>Units</th>
              <th className="sticky-header" key={`percentage-${index}`}>%</th>
            </>
          ))}
          <th className="sticky-header">Sales</th>
          <th className="sticky-header">Units</th>
          <th className="sticky-header">%</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(aggregatedData).map((desc, index) => {
          const weekTotal = aggregatedData[desc].reduce((acc, day) => {
            acc.sales += day.sales;
            acc.units += day.units;
            return acc;
          }, { sales: 0, units: 0 });
          const isEvenRow = index % 2 === 0;  // 计算这一行是否是偶数行
          const rowClass = isEvenRow ? 'even-row' : '';  // 根据是不是偶数行来选择CSS类名

          return (
            <tr key={index} className={rowClass}>
              <td className="sticky-description">{desc}</td>
              {aggregatedData[desc].map((day, dayIndex) => daysWithData[dayIndex] && (
                <>
                  <td key={`sales-${dayIndex}`}>{day.sales.toFixed(2)}</td>
                  <td key={`units-${dayIndex}`}>{day.units.toFixed(2)}</td>
                  <td key={`percentage-${dayIndex}`}>{((day.sales / totalSalesPerDay[dayIndex]) * 100).toFixed(2)}%</td>
                </>
              ))}
              <td>{weekTotal.sales.toFixed(2)}</td>
              <td>{weekTotal.units.toFixed(2)}</td>
              <td>{((weekTotal.sales / totalSalesPerWeek) * 100).toFixed(2)}%</td>
            </tr>
          );
        })}
        <tr className = "sticky-row" style={{ fontWeight: 'bold' }}>
          <td className="sticky-corner-bottom">Department Totals:</td>
          {departmentTotals.map((day, index) => daysWithData[index] && (
            <>
              <td key={`total-sales-${index}`}>{day.sales.toFixed(2)}</td>
              <td key={`total-units-${index}`}>{day.units.toFixed(2)}</td>
              <td key={`total-percentage-${index}`}></td>
            </>
          ))}
          <td>{departmentWeekTotal.sales.toFixed(2)}</td>
          <td>{departmentWeekTotal.units.toFixed(2)}</td>
          <td></td>
        </tr>
        <tr style={{ fontWeight: 'bold' }}>
            <td className="sticky-description">*Adjustments:</td>
            {dailyAdjustments.map((adj, index) => daysWithData[index] && (
                <>
                <td key={`adjustments-${index}`}>{Math.abs(adj) < 1e-10 ? '0.00' : adj.toFixed(2)}</td>

                <td key={`adjustments-units-${index}`}></td>
                <td key={`adjustments-percentage-${index}`}></td>
                </>
            ))}
            <td>{Math.abs(totalAdjustmentsForWeek) < 1e-10 ? '0.00' : totalAdjustmentsForWeek.toFixed(2)}</td>

            <td></td>
            <td></td>
        </tr>
        <tr style={{ fontWeight: 'bold' }}>
            <td className="sticky-description">Total Net Sales:</td>
            {totalNetSalesPerDay.map((sales, index) => daysWithData[index] && (
                <>
                <td key={`net-sales-${index}`}>{sales.toFixed(2)}</td>
                <td key={`net-units-${index}`}></td>
                <td key={`net-percentage-${index}`}></td>
                </>
            ))}
            <td>{totalNetSalesForWeek.toFixed(2)}</td>
            <td></td>
            <td></td>
        </tr>
        


      </tbody>
    </table>
  );
};

export default SalesAnalysisTable;
