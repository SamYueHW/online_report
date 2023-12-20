import React from 'react';
import { DatePicker, Space } from 'antd';
import './datepicker.scss';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// 启用 dayjs 的自定义解析格式插件
dayjs.extend(customParseFormat);

const WeekDatePickerComponent = ({ value, onChange }) => {
  console.log(value);

  const formatWeek = (value) => {
    // 确保 value 是有效的
    if (!value) {
      return '';
    }
    // 计算并格式化周的开始和结束日期
    return `${value.startOf('week').format('DD/MM/YYYY')} - ${value.endOf('week').format('DD/MM/YYYY')}`;
  };

  return (
    <Space direction="vertical" size={12}>
      <DatePicker 
        picker="week" 
       
        // 使用自定义解析格式解析传入的 value
        value={value ? dayjs(value, 'DD/MM/YYYY') : null}
        format={formatWeek} // 使用自定义格式化函数
        onChange={onChange}
      />
    </Space>
  );
};

export default WeekDatePickerComponent;
