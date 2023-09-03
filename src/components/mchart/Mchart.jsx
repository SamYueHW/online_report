import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import './mchart.scss';

const Mchart = ({ title, data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom);
    myChart.showLoading();

    const option = {
      color: ['#5470C6', '#EE6666'],
      tooltip: {
        trigger: 'none',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold', // 设置字体加粗
        },
      },
      grid: {
        top: 70,
        bottom: 50,
      },
      xAxis: [
        {
          type: 'category',
          axisTick: {
            alignWithLabel: true,
          },
          axisLine: {
            onZero: true,
            lineStyle: {
              color: '#EE6666',
            },
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return (
                  params.value +
                  (params.seriesData.length ? '：$ ' + params.seriesData[0].data : '')
                );
              },
            },
          },
          axisLabel: {
            fontWeight: 'bold', // 设置字体加粗
          },
          data: data.xAxisData1,
        },
        {
          type: 'category',
          axisTick: {
            alignWithLabel: true,
          },
          axisLine: {
            onZero: false,
            lineStyle: {
              color: '#5470C6',
            },
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return (
                  params.value +
                  (params.seriesData.length ? '： $ ' + params.seriesData[0].data : '')
                );
              },
            },
          },
          axisLabel: {
            fontWeight: 'bold', // 设置字体加粗
          },
          data: data.xAxisData2,
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: [
        {
          name: 'Last week',
          type: 'line',
          smooth: true,
          emphasis: {
            focus: 'series',
          },
          data: data.yAxisData2,
          lineStyle: {
            type: 'dashed', // 设置为虚线
            width: 2, // 设置线条宽度
            opacity: 0.7, // 设置线条透明度
            lineDash: [2, 20], // 设置虚线的间隔和长度
          },
          xAxisIndex: 1,
        },
        {
          name: 'This week',
          type: 'line',
          smooth: true,
          emphasis: {
            focus: 'series',
          },
          data: data.yAxisData1,
          xAxisIndex: 0,
        },
      ],
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
      <div className="chartInstance" ref={chartRef} style={{ width: '100%', height: '500px' }} />
    </div>
  );
};

export default Mchart;
