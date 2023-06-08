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
        orient: 'vertical',
        right: 10,
        top: 20,
        bottom: 20,
        data: data.map((item) => item.name),
        textStyle: { // 添加这个属性
          // fontSize: 13 // 用你想要的字体大小替换这里的值
          fontWeight: 'bold', // 设置字体加粗
      }
      },
      series: [
        {
          name: 'Category Sales',
          type: 'pie',
          radius: '60%',
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
            fontSize: 14, // 设置字体大小
            fontWeight: 'bold', // 设置字体加粗
          },
        }
      ]
    };

    myChart.setOption(option);
    myChart.hideLoading();

    // 在组件卸载时销毁图表实例
    return () => {
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
