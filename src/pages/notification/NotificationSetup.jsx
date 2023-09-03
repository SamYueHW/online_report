import axios from 'axios';
import React, { useState, useEffect } from 'react';
import useGetState from '../../hooks/useGetState';
import { useNavigate } from 'react-router-dom';
import Adminsidebar from '../../components/sidebar/Adminsidebar';
import "./notification.scss";

const NotificationSetup = () => {
  const [user, setUser, getUser] = useGetState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [publishTime, setPublishTime] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handlePublishTimeChange = (e) => {

    setPublishTime(e.target.value);
  };
  const formattedPublishTime = publishTime.replace('T', ' ').slice(0, 16);

  const handleKeyChange = (e) => {
    setSecretKey(e.target.value);
  };

  const handlePreviewClick = () => {
    setShowPreview(true);
  };

  const handleSubmitClick = async () => {
    if (title.length > 100) {
      setMessage('Title must be 100 characters or less.');
      return;
    }
    try {
      const response = await axios.post(process.env.REACT_APP_SERVER_URL + '/createNotification', {
        title: title,
        content: content,
        publishTime: publishTime,
        secretKey: secretKey
      }, { withCredentials: true });
  
      switch (response.status) {
        case 201:
          setMessage('Notification created successfully!');
          break;
        case 400:
          setMessage('Missing required fields. Please make sure all fields are filled.');
          break;
        case 403:
          setMessage('Invalid secret key. You are not authorized to create a notification.');
          break;
        default:
          setMessage('Failed to create notification, please try again.');
          break;
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 400) {
        setMessage('Missing required fields. Please make sure all fields are filled.');
      } else if (error.response && error.response.status === 403) {
        setMessage('Invalid secret key. You are not authorized to create a notification.');
      } else {
        setMessage('Failed to create notification, please try again.');
      }
    }
    setShowPreview(false);
  };
  

  return (
    <div className='notification_home'>
      <Adminsidebar user={getUser()} onLogout={handleLogout} isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div className="notification_home_container">
        <h2>Create Notification</h2>
        <label htmlFor="title">Title:</label>
        <input type="text" id="title" value={title} onChange={handleTitleChange} />
        <label htmlFor="content">Content:</label>
        <textarea id="content" value={content} onChange={handleContentChange} />
        <label htmlFor="publishTime">Publish Time:</label>

        <input type="datetime-local" id="publishTime" value={publishTime} onChange={handlePublishTimeChange} />
        <br />
        <button onClick={handlePreviewClick}>Preview</button>
        {showPreview && (
          <div className="preview">
            <h3>Preview</h3>
            <p><strong>Title:</strong> {title}</p>
            <p><strong>Publish Time:</strong> {formattedPublishTime}</p>
            <p><strong>Content:</strong> {content}</p>
            <label htmlFor="secretKey">Enter Secret Key:</label>
            <input type="text" id="secretKey" value={secretKey} onChange={handleKeyChange} />
            <br />
            <button onClick={handleSubmitClick}>Submit</button>
          </div>
        )}
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default NotificationSetup;
