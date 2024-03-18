import React, { Suspense, lazy } from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/login/Login.jsx';
import Dashboard from './pages/dashboard/Dashboardnew.jsx';

import SalesSummary from './pages/summary/SalesSummary.jsx';  
import WeeklySales from './pages/weeklysales/WeeklySales.jsx';

// import Admindashboard from './pages/admin/Admindashboard.jsx';
// import EditStore from './pages/admin/EditStore.jsx';
// import NotificationSetup from './pages/notification/NotificationSetup.jsx';
// import NotificationList from './pages/notification/NotificationList.jsx';
// import CheckStores from './pages/dashboard/CheckStores.jsx';


const NotificationSetup = lazy(() => import('./pages/notification/NotificationSetup.jsx'));
const NotificationList = lazy(() => import('./pages/notification/NotificationList.jsx'));
const CheckStores = lazy(() => import('./pages/dashboard/CheckStores.jsx'));
const Admindashboard = lazy(() => import('./pages/admin/Admindashboard.jsx'));
const EditStore = lazy(() => import('./pages/admin/EditStore.jsx'));
const QrOrderGenerator = lazy(() => import('./pages/admin/QrOrderGenerator.jsx'));

const App = () => {


  return (
    <BrowserRouter>
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        
        {/* <Route path="/store-history" element={<StoreHistory />} /> */}
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales-summary" element={<SalesSummary />} />
        <Route path="/weeklySales" element={<WeeklySales />} />

        <Route path="/notification-setup" element={<NotificationSetup />} />
        <Route path="/notification-list" element={<NotificationList />} />
        <Route path="/checkStores" element={<CheckStores />} />
        <Route path="/admin-dashboard" element={<Admindashboard />} />
        <Route path="/edit-store" element={<EditStore />} />
        <Route path="/qr-order-generator/:storeId" element={<QrOrderGenerator />} />



      </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;