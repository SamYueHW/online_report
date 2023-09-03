import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useGetState } from 'ahooks';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './editStore.scss'; // Import the CSS file for EditStore component

const EditStore = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const storeId = searchParams.get('store');
  const [storeData, setStoreData, getStoreData] = useGetState(null);
  const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
  const [relatedUserData, setRelatedUserData, getRelatedUserData] = useGetState(null);
  const [formData, setFormData] = useState({
    rExpiredDate: null,
    // 添加其他需要的输入字段
  });

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_SERVER_URL+`/store/${storeId}`);
        setStoreData(response.data.storeData);
        setRelatedUserData(response.data.userData);
        setFormData({
          rExpiredDate: response.data.storeData.r_expired_date ? new Date(response.data.storeData.r_expired_date) : getYesterdayDate(),
          // 设置其他输入字段的初始值
        });
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchStoreData();
  }, [storeId]);

  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  };

  const handleDateChange = (date) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      rExpiredDate: date,
    }));
  };

  const handleDeleteUser = async (userId,storeId) => {
    try {
      // 发送删除用户的请求
      await axios.delete(process.env.REACT_APP_SERVER_URL+`/user/${userId}:${storeId}`);
      // 更新相关用户数据
      await getRelatedUserData();
      // 执行其他逻辑
    } catch (error) {
      console.log(error);
      // 处理删除用户失败的逻辑
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // 执行提交逻辑，发送更新数据的请求
    try {
      const date = new Date(formData.rExpiredDate);
      const formattedDate = date.toLocaleDateString('en-AU');

      console.log(formattedDate);
      await axios.put(process.env.REACT_APP_SERVER_URL+`/store/${storeId}`, {
        rExpiredDate: formattedDate,
        // 添加其他需要更新的字段
      });

      // 更新成功后，重新获取数据
      await getStoreData();

      // 更新成功后的处理逻辑
    } catch (error) {
      console.log(error);
      // 更新失败后的处理逻辑
    }
  };

  if (getIsLoading()) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Edit Store</h1>
      {storeData && (
        <form className="edit-store-form" onSubmit={handleSubmit}>
          <div>
            <p>Store ID: {storeData.store_id}</p>
          </div>
          <div>
            <label>
              Report Expired Date:{' '}
              <DatePicker
                className="date-picker"
                selected={formData.rExpiredDate}
                onChange={handleDateChange}
                placeholderText="Select a date"
                dateFormat="dd/MM/yyyy" // 设置日期格式为澳大利亚格式，例如：31/12/2023
              />
            </label>
          </div>
          {/* 添加其他输入字段 */}
          <button type="submit" className="submit-button">Submit</button>
        </form>
      )}
      <div className="related-users">
        <h2>Related Users:</h2>
        <button className="delete-button"  >
              Add
            </button>
        {relatedUserData && relatedUserData.map((user) => (
          <div className="user-box" key={user.cus_id}>
            <div className="user-info">
              <p className="user-id">{`User ID: ${user.cus_id}`}</p>
              <p className="user-email">{`Email: ${user.email}`}</p>
            </div>
            <button className="delete-button" onClick={() => handleDeleteUser(user.cus_id,storeData.store_id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditStore;
