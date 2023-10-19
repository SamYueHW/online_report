import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './pages/dashboard/dashboardnew.scss';
import './pages/weeklysales/WeeklySales.scss';

const Register = lazy(() => import('./pages/register/Register.jsx'));
const Login = lazy(() => import('./pages/login/Login.jsx'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboardnew.jsx'));
const EditStore = lazy(() => import('./pages/admin/EditStore.jsx'));
const StoreHistory = lazy(() => import('./pages/storehistory/StoreHistory.jsx'));
const NotificationSetup = lazy(() => import('./pages/notification/NotificationSetup.jsx'));
const NotificationList = lazy(() => import('./pages/notification/NotificationList.jsx'));
const CheckStores = lazy(() => import('./pages/dashboard/CheckStores.jsx'));
const SalesSummary = lazy(() => import('./pages/summary/SalesSummary.jsx'));
const Admindashboard = lazy(() => import('./pages/admin/Admindashboard.jsx'));
const WeeklySales = lazy(() => import('./pages/weeklysales/WeeklySales.jsx'));

// import WeeklySalesGP from './pages/weeklysales/WeeklySalesGP.jsx';

const App = () => {


  return (
    <BrowserRouter>
    {/* <Suspense fallback={<div>Loading...</div>}> */}
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
        <Route path="/weeklySales" element={<WeeklySales />} />
        {/* <Route path="/weeklySales_GP" element={<WeeklySalesGP />} /> */}

        <Route path="/admin-dashboard" element={<Admindashboard />} />

      </Routes>
      {/* </Suspense> */}
    </BrowserRouter>
  );
};

export default App;
