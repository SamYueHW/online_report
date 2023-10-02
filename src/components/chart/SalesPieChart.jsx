import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

const SalesPieChart = ({ data }) => {
    const [radius, setRadius] = useState(['20%', '80%']);
    useEffect(() => {
        function handleResize() {
          if (window.innerWidth < 768) {
            setRadius(['5%', '50%']);
          } else {
            setRadius(['20%', '80%']);
          }
        }
    
        handleResize();
        window.addEventListener('resize', handleResize);
    
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);
  const options = {
    // legend: {
    //   top: 'bottom',
    //   type: 'scroll',  // 设置为滚动类型
    //   orient: 'horizontal',  // 横向
    // },
    legend: {
        show: false,  // 隐藏图例
      },
    toolbox: {
      show: true,
      feature: {
        saveAsImage: { show: true },
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        return `<strong>${params.data.name}</strong><br/>Amount: ${params.data.value}<br/>Percentage: ${params.data.percentage}%`;
      },
    },
    series: [
      {
        name: 'Sales Data',
        type: 'pie',
        // radius: [50, 250],
        radius: radius,  // 修改半径
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8,
        },
        label: {
            show: true,
            formatter: function(params) {
              return [
                `{a|${params.data.name}}`,
                `{b|${params.data.percentage}%}`
              ].join('\n');
            },
            rich: {
              a: {
                fontWeight: 'bold'
              },
              b: {
                fontWeight: 'normal'
              }
            }
          },
          
        data: data.map(item => ({
          value: item.Amount,
          name: item.Description,
          percentage: item.Percentage,
        })),
      },
    ],
  };

  return <div style={{ marginTop: '2rem' }}>  {/* 添加 margin-top */}
  <ReactECharts option={options} />
</div>;
};

export default SalesPieChart;
