import React, { useState, useEffect } from 'react';
import { Modal, Select } from 'antd';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';


const { Option } = Select;

const LogDataModal = ({ isVisible, onClose }) => {
  const [logData, setLogData] = useState({ dates: [], loginRatios: [], dailyCounts: [] });
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (isVisible) {
      getLogData(selectedCategory);
    }
  }, [isVisible, selectedCategory]);

  const getLogData = async (category) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/getLogData`, 
        {
          headers: {
            'authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`
          },
          withCredentials: true
        }
      );
        console.log(response.data);
      const filteredData = response.data.userCounts.filter(user => 
        category === 'all' || user.Category === category
      );

      const dates = response.data.dailyCounts.map(item => 
        new Date(item.Date).toLocaleDateString('en-GB')
      );
      const dailyCounts = response.data.dailyCounts.map(item => item.UserCount);

      const loginRatios = response.data.dailyCounts.map((daily, index) => {
        const loginCount = filteredData.filter(user => 
          new Date(user.login_time).toLocaleDateString('en-GB') === new Date(daily.Date).toLocaleDateString('en-GB')
        ).length;
        return (loginCount / daily.UserCount) * 100;
      });

      setLogData({ dates, loginRatios, dailyCounts });
    } catch (error) {
      console.error("Error fetching log data:", error);
    }
  };

  const getOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          const index = params[0].dataIndex;
          return `<b>${logData.dates[index]}</b><br/>Total Stores: ${logData.dailyCounts[index]}<br/>Logged-in Users: ${Math.round(logData.loginRatios[index] * logData.dailyCounts[index] / 100)}<br/>Ratio: ${params[0].value.toFixed(2)}%`;
        }
      },
      xAxis: {
        type: 'category',
        data: logData.dates
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          data: logData.loginRatios,
          type: 'line',
          smooth: true
        }
      ]
    };
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  return (
    <Modal title="Active User Ratio" open={isVisible} onOk={onClose} onCancel={onClose} width={700}>
      <Select defaultValue="all" style={{ width: 120, marginBottom: 20 }} onChange={handleCategoryChange}>
        <Option value="all">All</Option>
        <Option value="syd">Syd</Option>
        <Option value="melb">Melb</Option>
        <Option value="qld">Qld</Option>
      </Select>
      {logData.dates.length > 0 && <ReactECharts option={getOption()} style={{ height: 400 }} />}

    </Modal>
  );
};

export default LogDataModal;
