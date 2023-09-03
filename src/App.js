import React, { useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/register/Register.jsx';
import Login from './pages/login/Login.jsx';
import Dashboard from './pages/dashboard/Dashboardnew.jsx';
import EditStore from './pages/editstore/EditStore.jsx';
import StoreHistory from './pages/storehistory/StoreHistory.jsx';
import NotificationSetup from './pages/notification/NotificationSetup.jsx';
import NotificationList from './pages/notification/NotificationList.jsx';
import CheckStores from './pages/dashboard/CheckStores.jsx';

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false); // 管理员身份状态
  const [isLoading, setIsLoading] = useState(true); // 加载状态

  useEffect(() => {
    // 从存储中获取 JWT，并解析以检查用户是否是管理员
    const token = sessionStorage.getItem('token');

    if (token) {
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.isAdmin); // 假设 isAdmin 是在 JWT 的有效负载中设置的
    }

    setIsLoading(false); // 设置加载完成
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // 可以显示一个加载动画或者占位符
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/edit-store" element={isAdmin ? <EditStore /> : <Navigate to="/" />} />
        <Route path="/store-history" element={isAdmin ? <StoreHistory /> : <Navigate to="/" />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notification-setup" element={isAdmin ? <NotificationSetup /> : <Navigate to="/dashboard" />} />
        <Route path="/notification-list" element={isAdmin ? <NotificationList /> : <Navigate to="/dashboard" />} />
        <Route path="/checkStores" element={<CheckStores />}/> 

      </Routes>
    </BrowserRouter>
  );
};

export default App;
