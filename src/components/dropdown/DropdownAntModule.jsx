import React, { useState, useEffect } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Space, Typography } from 'antd';

const DropdownAntModule = ({ options, defaultSelected, onSelect }) => {
  // 初始化选中的项
  const [selectedKey, setSelectedKey] = useState('');
    
  useEffect(() => {
    console.log('defaultSelected: ', defaultSelected);
    setSelectedKey(defaultSelected);
  }
    , [defaultSelected]);
  
  // 根据selectedKey找到当前选项的标签
  const selectedLabel = options.find(option => option.key === selectedKey)?.label || 'Selectable';

  // 处理选项改变的函数
  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
    onSelect(e.key); // 调用传入的 onSelect 回调函数
    
  };

  // 构造Dropdown菜单项
  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={options}
      selectable
      selectedKeys={[selectedKey]}
    />
  );

  return (
    <Dropdown overlay={menu}>
      <Typography.Link>
        <Space>
          {selectedLabel} {/* 显示选中项的标签而不是固定文本 */}
          <DownOutlined />
        </Space>
      </Typography.Link>
    </Dropdown>
  );
};

export default DropdownAntModule;
