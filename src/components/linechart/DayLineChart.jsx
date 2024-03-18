import React from 'react';
import ReactECharts from 'echarts-for-react';
const DayLineChart = ({ dates1, dates2, values1, values2 }) => {
    
    function formatCurrency(value) {
        // 确保 value 是一个数字
        if (value === 0) {
            return '0';
        }
        if (typeof value !== 'number') {
            return value;
        }
    
        // 将数字转换为字符串，然后应用正则表达式进行格式化
        return '$' +value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '$&,');
    }
    
    const getOption = () => {
        return {
            color: ['#5470C6', '#EE6666'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                formatter: function (params) {
                    let res = '';
                    params.forEach(item => {
                        res += `<span style='color:${item.color}'>${item.axisValueLabel}</span>: ${formatCurrency (item.value)}<br/>`;
                    });
                    return res;
                }
            },
            legend: {show: false // 不显示图例
            },
            grid: {
                top: 70,
                bottom: 50,
                
            },
            xAxis: [
                {
                    type: 'category',
                    axisTick: {
                        alignWithLabel: true
                    },
                    axisLine: {
                        onZero: false,
                        lineStyle: {
                            color: '#5470C6'
                        }
                    },
                    data: dates1
                },
                {
                    type: 'category',
                    axisTick: {
                        alignWithLabel: true
                    },
                    axisLine: {
                        onZero: false,
                        lineStyle: {
                            color: '#EE6666'
                        }
                    },
                    data: dates2
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLabel: {
                        // 使用formatter格式化Y轴标签
                        formatter: function (value) {
                            return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
                        }
                    }
                }
            ],
            series: [
                {
                    name: 'Series 1',
                    type: 'line',
                    xAxisIndex: 0,
                    smooth: true,
                    emphasis: {
                        focus: 'series'
                    },
                    data: values1
                },
                {
                    name: 'Series 2',
                    type: 'line',
                    xAxisIndex: 1,
                    smooth: true,
                    emphasis: {
                        focus: 'series'
                    },
                    data: values2
                }
            ]
        };
    };

    return <ReactECharts option={getOption()} />;
};

export default DayLineChart;
