import React, { useState,useEffect , useRef } from "react";

import "./dropdown.scss";
import 'react-date-range/dist/styles.css'; // 主样式文件
import 'react-date-range/dist/theme/default.css'; // 主题样式文件
import { DateRangePicker,createStaticRanges,DateRange  } from 'react-date-range';
import { startOfISOWeek, endOfISOWeek, subDays, subMonths, isSameDay, startOfMonth, endOfMonth, addMonths } from 'date-fns';


function DropdownCalendar({  onRangeSelect,  }) {
  const [isActive, setIsActive] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [displayedRange, setDisplayedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });


  function formatDateString(date) {
    //format "2023-12-28T15:51:52.876Z" to "29th Dec 2023",不一定是th，有可能是st，等等

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'June',
        'July',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
        ];
    const monthName = months[month];
    const dateString = `${day} ${suffix} ${monthName} ${year}`;
    return dateString;


    // console.log(date);
    // return `${date}`;
    
  }
  const shouldShowSingleDate = displayedRange.startDate.getTime() === displayedRange.endDate.getTime();
  const displayDate = shouldShowSingleDate ? formatDateString(displayedRange.startDate) : `${formatDateString(displayedRange.startDate)} - ${formatDateString(displayedRange.endDate)}`;

  const handleSelect = (ranges) => {
   
    onRangeSelect(ranges.selection); // 调用传入的回调函数
    setDisplayedRange(ranges.selection); // 更新界面显示的日期范围

  };
  const handleResize = () => {
    setScreenWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsActive(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []); 

  const staticRanges = createStaticRanges([

        {
            label: 'Today',
            range: () => ({
              startDate: new Date(),
              endDate: new Date(),
              key: 'selection',
            }),
            isSelected: (range) => isSameDay(range.startDate, new Date()) && isSameDay(range.endDate, new Date()),
          },
          {
            label: 'Yesterday',
            range: () => ({
              startDate: subDays(new Date(), 1),
              endDate: subDays(new Date(), 1),
              key: 'selection',
            }),
            isSelected: (range) =>
              isSameDay(range.startDate, subDays(new Date(), 1)) && isSameDay(range.endDate, subDays(new Date(), 1)),
          },
          {
            label: 'Last week',
            range: () => ({
              startDate: startOfISOWeek(subDays(new Date(), 7)),
              endDate: endOfISOWeek(subDays(new Date(), 7)),
              key: 'selection'
            }),
            isSelected: (range) => {
              if (range.startDate && range.endDate) {
                return (
                  isSameDay(range.startDate, startOfISOWeek(subDays(new Date(), 7))) &&
                  isSameDay(range.endDate, endOfISOWeek(subDays(new Date(), 7)))
                )
              }
              return false;
            }
          },
          {
            label: 'This week',
            range: () => ({
              startDate: startOfISOWeek(new Date()),
              endDate: endOfISOWeek(new Date()),
              key: 'selection'
            }),
            isSelected: (range) => {
              if (range.startDate && range.endDate) {
                return (
                  isSameDay(range?.startDate, startOfISOWeek(new Date())) &&
                  isSameDay(range?.endDate, endOfISOWeek(new Date()))
                )
              }
              return false;
            }
          },
          {
            label: 'This Month',
            range: () => ({
              startDate: startOfMonth(new Date()),
              endDate: endOfMonth(new Date()),
              key: 'selection',
            }),
            isSelected: (range) =>
              isSameDay(range.startDate, startOfMonth(new Date())) && isSameDay(range.endDate, endOfMonth(new Date())),
          },
          {
            label: 'Last Month',
            range: () => ({
              startDate: startOfMonth(subMonths(new Date(), 1)),
              endDate: endOfMonth(subMonths(new Date(), 1)),
              key: 'selection',
            }),
            isSelected: (range) =>
              isSameDay(range.startDate, startOfMonth(subMonths(new Date(), 1))) &&
              isSameDay(range.endDate, endOfMonth(subMonths(new Date(), 1))),
          },
        ]);

        const renderDatePicker = () => {
            if (screenWidth < 610) {
              return (
                <DateRange
                  editableDateInputs={true}
                  scroll={{ enabled: true }}
                  onChange={handleSelect}
                  moveRangeOnFirstSelection={false}
                  ranges={[displayedRange]}
                  weekStartsOn={1}
                />
              );
            } else {
                return (
                <DateRangePicker
                direction="vertical"
                scroll={{ enabled: true }}
                staticRanges={staticRanges}
                
                ranges={[displayedRange]}
                onChange={handleSelect}
                weekStartsOn={1}
              />);
            }}

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div className="dropdown-btn" onClick={() => setIsActive(!isActive)}>
      <span className="display-date">{displayDate}</span>
        <span className="material-icons-sharp">arrow_drop_down</span>
      </div>
      {isActive && (
        <div className="dropdown-content">
         {renderDatePicker()}
        </div>
      )}
    </div>
  );
}

export default DropdownCalendar;
