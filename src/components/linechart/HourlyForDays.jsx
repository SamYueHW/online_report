import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const HourlyForDays = ({ chartData }) => {
  const chartRef = useRef(null);
  const data = chartData;

  useEffect(() => {
    if (chartRef.current && data) {
      const chartInstance = echarts.init(chartRef.current);
      const options = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          
          formatter: (params) => {
            let result = `<b>${params[0].axisValueLabel}</b><br/>`;
            params.forEach((item) => {
                // 使用 toLocaleString() 方法格式化数值，并使金额数值右对齐
                const formattedAmount = `$${item.data.toLocaleString()}`;
                result += `<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                              <span>${item.marker}${item.seriesName}</span>
                              <span style="font-weight: bold; margin-left: 10px;">${formattedAmount}</span>
                           </div>`;
            });
            return result;
        }
        
        },
        toolbox: {
          feature: {
            magicType: { show: true, type: ['line', 'bar'] }
          }
        },
        legend: {
          data: data.map(d => d.legend),
          bottom: 0
        },
        xAxis: {
          type: 'category',
          data: data[0].hours.map(hour => `${hour}H`)
        },
        yAxis: {
          type: 'value',
          name: 'Total Amount'
        },
        series: data.map(group => ({
          name: group.legend,
          type: 'bar',
          data: group.amounts,
          smooth: true
        }))
      };

      chartInstance.setOption(options);
    }
  }, [data]);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default HourlyForDays;
