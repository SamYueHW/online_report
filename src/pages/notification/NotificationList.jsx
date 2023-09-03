import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGetState from '../../hooks/useGetState';
import Adminsidebar from '../../components/sidebar/Adminsidebar';
import moment from 'moment';
import "./notificationlist.scss";

const NotificationList = () => {
  const [user, setUser, getUser] = useGetState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get(process.env.REACT_APP_SERVER_URL + '/logout', { withCredentials: true });
      setUser(null);
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_SERVER_URL + '/getNotifications', { withCredentials: true });
        setNotifications(response.data.notifications);
        console.log(response.data.notifications);
      } catch (error) {
        console.log(error);
      }
    };

    fetchNotifications();
  }, []);

  const handleEdit = (nId) => {
    navigate(`/edit-notification?nid=${nId}`);
  };

  return (
    <div className='notification_home'>
      <Adminsidebar user={getUser()} onLogout={handleLogout} isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div className="notification_container">
        <h2>Notifications</h2>
        {notifications.map((notification, index) => (
          <div key={index} className="notification_item">
            <h3>{notification.Title}</h3>
            <p>{notification.Content}</p>
            <p>Publish Date: {moment(notification.PublishDate).format('YYYY-MM-DD HH:mm:ss')}</p> {/* 使用moment进行日期格式化 */}
            <button className="edit-button" onClick={() => handleEdit(notification.NotiId)}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationList;
