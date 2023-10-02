import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

const Mchart = ({ title, data, dateType }) => {
  const chartRef = useRef(null);
  const [showComparedWeek, setShowComparedWeek] = useState(!!data.yAxisData2);

  useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom);
    myChart.showLoading();

    const seriesData = [
      {
        name: dateType === 'Yearly' ? 'Selected Year' : 'Selected Week',  // 根据 dateType 来设置 name
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
        name: dateType === 'Yearly' ? 'Compared Year' : 'Compared Week', 
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
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      grid: {
        left: '20%',  // Increase this value as needed
        top: 70,
        bottom: 50,
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
                return params.value + (params.seriesData.length ? ':$ ' + formattedData : '');
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
                  (params.seriesData.length ? '：$ ' + params.seriesData[0].data : '')
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
