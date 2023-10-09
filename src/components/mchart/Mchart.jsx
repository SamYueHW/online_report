import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

const Mchart = ({ title, data, dateType }) => {

  const chartRef = useRef(null);
  const [showComparedWeek, setShowComparedWeek] = useState(!!data.yAxisData2);
  console.log(data);

  useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom);
    myChart.showLoading();
    const gridBottom =  data.xAxisData2.length > 0  ? 80 : 60;

    const legendData = [];

    if (dateType === 'Weekly') {
      if (data.xAxisData1.length > 0) {
        const firstDate = data.xAxisData1[0].split(' ')[0]; // 获取第一个日期
        const lastDate = data.xAxisData1[data.xAxisData1.length - 1].split(' ')[0]; // 获取最后一个日期
        console.log(firstDate);
        legendData.push(`Selected: ${firstDate} to ${lastDate}`);
      }
  
      if (showComparedWeek && data.xAxisData2.length > 0) {
        const firstDate = data.xAxisData2[0].split(' ')[0]; // 获取第一个日期
        const lastDate = data.xAxisData2[data.xAxisData2.length - 1].split(' ')[0]; // 获取最后一个日期
        legendData.push(`Compared: ${firstDate} to ${lastDate}`);
      }
    } else {
      // 非 'Monthly' 的情况
      if (data.xAxisData1.length > 0) {
        legendData.push(`Selected: ${data.xAxisData1[0]} to ${data.xAxisData1[data.xAxisData1.length - 1]}`);
      }
  
      if (showComparedWeek && data.xAxisData2.length > 0) {
        legendData.push(`Compared: ${data.xAxisData2[0]} to ${data.xAxisData2[data.xAxisData2.length - 1]}`);
      }
    }

    let seriesNameForSelected = data.xAxisData1.length > 0 ? `Selected: ${data.xAxisData1[0]} to ${data.xAxisData1[data.xAxisData1.length - 1]}` : '';
let seriesNameForCompared = data.xAxisData2.length > 0 ? `Compared: ${data.xAxisData2[0]} to ${data.xAxisData2[data.xAxisData2.length - 1]}` : '';

if (dateType === 'Weekly') {
  if (data.xAxisData1.length > 0) {
    const firstDate = data.xAxisData1[0].split(' ')[0]; // 获取第一个日期
    const lastDate = data.xAxisData1[data.xAxisData1.length - 1].split(' ')[0]; // 获取最后一个日期
    seriesNameForSelected = `Selected: ${firstDate} to ${lastDate}`;
  }

  if (showComparedWeek && data.xAxisData2.length > 0) {
    const firstDate = data.xAxisData2[0].split(' ')[0]; // 获取第一个日期
    const lastDate = data.xAxisData2[data.xAxisData2.length - 1].split(' ')[0]; // 获取最后一个日期
    seriesNameForCompared = `Compared: ${firstDate} to ${lastDate}`;
  }
}

const seriesData = [
  {
    name: seriesNameForSelected,  // 使用动态设置的 seriesNameForSelected
    type: 'bar',
    emphasis: {
      focus: 'series',
    },
    data: data.yAxisData1,
    xAxisIndex: 0,
  }
];

if (showComparedWeek) {
  seriesData.push({
    name: seriesNameForCompared,  // 使用动态设置的 seriesNameForCompared
    type: 'bar',
    emphasis: {
      focus: 'series',
    },
    data: data.yAxisData2,
    xAxisIndex: 0,
  });
}

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
          fontSize: 11,
          fontWeight: 'bold',
        },

        data: legendData,  // 使用动态设置的 legendData
      },
      grid: {
        left: '20%',  // Increase this value as needed
        top: 70,
        bottom: gridBottom,
      },
      axisPointer: {
        link: { xAxisIndex: 'all' },  // 这里链接所有的 X 轴
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
              color: '#5470C6',
            },
          },
          
          axisPointer: {
            label: {
              formatter: function(params) {
                const formattedData = params.seriesData.length ? parseFloat(params.seriesData[0].data).toLocaleString() : '';
                return params.value + (params.seriesData.length ? ': $' + formattedData : '');
              }
            }
          },
          
          axisLabel: {
            fontWeight: 'bold',
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
              color: '#EE6666',
            },
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return (
                  params.value +
                  (params.seriesData.length ? ': $ ' + params.seriesData[0].data : '')
                );
              },
            },
          },
          axisLabel: {
            fontWeight: 'bold',
          },
          data: data.xAxisData2,
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            formatter: function(value) {
              if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
              if (value >= 1000) return (value / 1000).toFixed(2) + 'K';
              return value.toFixed(2);
            }
          }
        }
      ],
      series: seriesData,
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
  }, [data, showComparedWeek]);

  useEffect(() => {
    setShowComparedWeek(!!data.yAxisData2);
  }, [data]);

  return (
    <div className="chart">
      <div className="title">{title}</div>
      <div className="chartInstance" ref={chartRef} style={{ width: '100%', height: '500px' }} />
    </div>
  );
};

export default Mchart;