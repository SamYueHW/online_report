import React, { useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/register/Register.jsx';
import Login from './pages/login/Login.jsx';
import Dashboard from './pages/dashboard/Dashboardnew.jsx';
import EditStore from './pages/admin/EditStore.jsx';
import StoreHistory from './pages/storehistory/StoreHistory.jsx';
import NotificationSetup from './pages/notification/NotificationSetup.jsx';
import NotificationList from './pages/notification/NotificationList.jsx';
import CheckStores from './pages/dashboard/CheckStores.jsx';
import SalesSummary from './pages/summary/SalesSummary.jsx';  

import Admindashboard from './pages/admin/Admindashboard.jsx';

const App = () => {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/edit-store" element={<EditStore />} />
        <Route path="/store-history" element={<StoreHistory />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales-summary" element={<SalesSummary />} />
        <Route path="/notification-setup" element={<NotificationSetup />} />
        <Route path="/notification-list" element={<NotificationList />} />
        <Route path="/checkStores" element={<CheckStores />} />

        <Route path="/admin-dashboard" element={<Admindashboard />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
