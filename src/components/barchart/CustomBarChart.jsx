import React, { useEffect } from 'react';
import * as echarts from 'echarts';

const CustomBarChart = ({ data }) => {
  useEffect(() => {
    
    const chartDom = document.getElementById('custom-bar-chart');
    const myChart = echarts.init(chartDom);

    const utcToAEST = (dateString) => {
        // 转换为澳大利亚东部时间（例如，悉尼）
        const utcDate = new Date(dateString);
        const aestOffset = 10 * 60 * 60000; // AEST是UTC+10
        const aestDate = new Date(utcDate.getTime() + aestOffset);
        return aestDate;
      };
  
      const xAxisData = data.map(item => {
        // 将UTC时间转换为AEST时间
        const startDate = utcToAEST(item.start);
        const endDate = utcToAEST(item.end);
  
        // 格式化日期
        const formatStartDate = `${startDate.getDate()}/${startDate.getMonth() + 1}`;
        const formatEndDate = `${endDate.getDate()}/${endDate.getMonth() + 1}`;
  
        return `${formatStartDate}-${formatEndDate}`;
      });
    const seriesData = data.map(item => item.total);
    const barWidth = data.length <= 5 ? '20%' : '60%';

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        // 使用formatter函数来自定义tooltip的内容
        formatter: (params) => {
            // params是一个数组，数组中包含了每个系列的数据信息
            return params.map((param) => {
              // param.value是当前点的值，param.seriesName是系列名称
              // 将值转换为两位小数，并添加逗号作为千位分隔符
              const value = parseFloat(param.value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              return `${param.seriesName}<br>${param.axisValueLabel} : $${value}`;
            }).join('');
          }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: 'Total',

          type: 'bar',
           barWidth: barWidth,
          data: seriesData
        }
      ]
    };

    myChart.setOption(option);
  }, [data]);

  return <div id="custom-bar-chart" style={{ width: '100%', height: '400px' }} />;
};

export default CustomBarChart;
