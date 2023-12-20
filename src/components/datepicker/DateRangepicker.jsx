
// DatePickerComponent.jsx
import React from 'react';
import { DatePicker, Space } from 'antd';
import dayjs from 'dayjs';
import './datepicker.scss';

// 这里定义了一个简单的 DatePicker 组件
// 它接受两个 props: value 和 onChange
const { RangePicker } = DatePicker;

const dateFormat = 'YYYY/MM/DD';
const weekFormat = 'MM/DD';
const monthFormat = 'YYYY/MM';

/** Manually entering any of the following formats will perform date parsing */
const dateFormatList = ['DD/MM/YYYY', 'DD/MM/YY', 'DD-MM-YYYY', 'DD-MM-YY'];
const DateRangePickerComponent = ({ value, onChange }) => {

  const isValidDate = dayjs(value[0], dateFormatList[0], true).isValid();
  const isValidDate2 = dayjs(value[1], dateFormatList[0], true).isValid();

  return (
    <Space direction="vertical" size={12}>
    <RangePicker 
      //  value={value ? [dayjs(value[0], dateFormatList[0]), dayjs(value[1], dateFormatList[0])] : null}
      value={isValidDate&&isValidDate2 ? [dayjs(value[0], dateFormatList[0]), dayjs(value[1], dateFormatList[0])] : null}
      onChange={onChange}
      format="DD/MM/YYYY"
    />
     </Space>
  );
};

export default DateRangePickerComponent;
