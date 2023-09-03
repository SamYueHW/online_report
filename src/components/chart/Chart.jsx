import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

import "./chart.scss";

const Chart = ({ aspect, title, data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom);
    myChart.showLoading();

    const formatUtil = echarts.format;

    const option = {
      toolbox: {
        feature: {
          saveAsImage: { name: 'Category Analyze' }
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(info) {
          const value = info.value;
          const name = info.name;

          // 计算占比
          const total = data.reduce((sum, item) => sum + item.value, 0);
          const percentage = ((value / total) * 100).toFixed(2);

          return (
            '<div class="tooltip-title">' +
            '<span style="font-size: 16px; font-weight: bold;">' +
            formatUtil.encodeHTML(name) +
            "</span>" +
            "<br/>" +
            '<span>Amount: $' +
            formatUtil.addCommas(value) +
            "</span>" +
            "<br/>" +
            '<span>Percentage: ' +
            percentage +
            "%</span>"
          );
        }
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
       
  
        right: 10,
        top: 20,
        bottom: 20,
        data: data.map((item) => item.name),
        textStyle: {
          fontWeight: 'bold',
         
        }
        
      },
      series: [
        {
          name: 'Category Sales',
          type: 'pie',
          radius: '61%',
          center: ['40%', '50%'],
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        }
      ]
    };

    myChart.setOption(option);
    myChart.hideLoading();

    function resizeChart() {
      myChart.resize();
    }

    window.addEventListener('resize', resizeChart);

    return () => {
      window.removeEventListener('resize', resizeChart);
      myChart.dispose();
    };
  }, [data]);

  return (
    <div className="chart">
      <div className="title">{title}</div>
      <div ref={chartRef} style={{ width: "100%", height: "500px" }} />
    </div>
  );
};

export default Chart;
