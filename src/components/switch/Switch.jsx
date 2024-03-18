import React, { useEffect, useRef } from 'react';
import { Switch } from 'antd';

const CustomSwitch = ({ checked, checkedText, uncheckedText, checkedColor, uncheckedColor, onChange }) => {
  const switchRef = useRef(null);

  useEffect(() => {
    // 当组件加载或者 `checked` 属性改变时，更新背景颜色
    if (switchRef.current) {
      switchRef.current.style.backgroundColor = checked ? checkedColor : uncheckedColor;
    }
  }, [checked, checkedColor, uncheckedColor]);

  return (
    <Switch
      ref={switchRef}
      checkedChildren={checkedText}
      unCheckedChildren={uncheckedText}
      defaultChecked={checked}
      style={{ backgroundColor: checked ? checkedColor : uncheckedColor }}
      className={`custom-switch-${checkedText}`}
      onChange={(checked) => {
        // 此时不需要再手动更新背景颜色，因为 `useEffect` 会处理
        onChange(checked); // 调用父组件的回调函数
      }}
    />
  );
};

export default CustomSwitch;
