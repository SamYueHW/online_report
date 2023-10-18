import * as React from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import './datepicker.scss';
import moment from "moment";

moment.updateLocale("en", {
    week: {
      dow: 1
    }
});

export default function FirstComponent({ defaultDate, onDateChange }) {
    // 定义一个函数来检查日期是否为星期一
    const disableAllDaysExceptMonday = (date) => {
      return date.day() !== 1;
    };
    const handleDateSelection = (date) => {
      // 其他逻辑...
      onDateChange(date); // 调用从父组件传入的回调函数
    };

    return (
      <div className="datepicker-component">
        <LocalizationProvider dateAdapter={AdapterMoment} locale="en-au">
          <DatePicker
            // 传递 disableAllDaysExceptMonday 函数给 shouldDisableDate 属性
            shouldDisableDate={disableAllDaysExceptMonday}
            // 设置日期格式为 "DD/MM/YYYY"
            format="DD/MM/YYYY"
            value={defaultDate}
            onChange={handleDateSelection}
            // 传递 renderDay 函数给 renderDay 属性
            // renderDay={renderDay}
          />
        </LocalizationProvider>
      </div>
    );
}
