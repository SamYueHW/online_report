// DatePickerComponent.jsx
import React from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import './datepicker.scss';

// 这里定义了一个简单的 DatePicker 组件
// 它接受两个 props: value 和 onChange

const dateFormat = 'YYYY/MM/DD';
const weekFormat = 'MM/DD';
const monthFormat = 'YYYY/MM';

/** Manually entering any of the following formats will perform date parsing */
const dateFormatList = ['DD/MM/YYYY', 'DD/MM/YY', 'DD-MM-YYYY', 'DD-MM-YY'];
const DatePickerComponent = ({ value, onChange }) => {
  const isValidDate = dayjs(value, dateFormatList[0], true).isValid();
  return (
    <DatePicker
    defaultValue={isValidDate ? dayjs(value, dateFormatList[0]) : null}
      onChange={onChange}
      format="DD/MM/YYYY"
    />
  );
};

export default DatePickerComponent;
