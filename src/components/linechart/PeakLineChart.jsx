import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const PeakLineChart = ({ data }) => {
 
  const chartRef = useRef(null);
  console.log(data);
    
  useEffect(() => {
    

    const chartInstance = echarts.getInstanceByDom(chartRef.current) || echarts.init(chartRef.current);
    const convertTo12HourFormat = hour => {
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      const period = hour < 12 ? ' AM' : ' PM';
      return `${hour12}${period}`;
    };
    const series1Data = data[0].map(item => [convertTo12HourFormat(item.hour), item.amount]);
    const series2Data = data[1]?.map(item => [convertTo12HourFormat(item.hour), item.amount]);  // 使用 ?. 以防止 data[1] 不存在
    let Data1Date = "Today";

    let Data2Date = "Yesterday";
    if (Array.isArray(data[2]) && data[2].length > 0) {
        Data1Date = data[2][0];
        Data2Date = data[2][1];
    } 
    const series = [
        {
          name: Data1Date,
          type: 'bar',
          data: series1Data,
          barWidth: '30%',
        }
      ];
    const legendData = [Data1Date];

    // 如果 series2Data 存在，则添加到 series 和 legendData
    if (series2Data && series2Data.length > 0) {
      series.push({
        name: Data2Date,
        type: 'bar',
        data: series2Data,
        barWidth: '30%',
      });
      legendData.push(Data2Date);
    }

    function convertTo24Hour(timeStr) {
      const [time, period] = timeStr.split(' ');
      let hour = parseInt(time, 10);
  
      if (period.toUpperCase() === 'PM' && hour !== 12) {
          hour += 12;
      }
      if (period.toUpperCase() === 'AM' && hour === 12) {
          hour = 0;
      }
  
      return hour;
  }
  
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
            const firstSeries = params[0];
            const hour = firstSeries ? firstSeries.value[0] : 'Unknown';
            
            // 在顶部添加总的 "Hour" 信息并加粗
            let tooltipText = `<strong>${hour}</strong><br/>`;
            
            params.forEach(param => {
              const seriesName = param.seriesName;  // 获取该系列的名称
              const value = param.value;  // 获取该数据点的值
              const hour24 = convertTo24Hour(param.value[0]);  // 例如，这里会将 "2 PM" 转换为 14
const dataItem = data[param.seriesIndex].find(item => item.hour === hour24);

              // 使用 marker 语法添加与图例相同的颜色点
              const colorPoint = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:${param.color}"></span>`;
              
              tooltipText += `${colorPoint}Amount: $${value[1].toLocaleString()}<br/>`;
              tooltipText += `Transaction: ${dataItem ? dataItem.transaction : 0}<br/><br/>`;
            });
          
            return tooltipText;
          }
          
      },
      legend: {
        data: legendData,
        orient: 'horizontal',  // horizontal 是默认值，也可以不设置
        bottom: 0  // 设置图例在图表下方
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,  // 对于柱状图，通常将这个值设置为 true
        data: data[0].map(item => convertTo12HourFormat(item.hour)),
        axisLabel: {
            formatter: '{value}'  // 在每个标签后面添加 'H'
          }
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '30%'],
        axisLabel: {
          formatter: function (value) {
            // 使用toLocaleString来格式化数字，实现千位分隔符
            return value.toLocaleString();
          }
        },
      },
      series: series,
    };

    chartInstance.setOption(option);
  }, [data]);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '400px' }}></div>
  );
};

export default PeakLineChart;
