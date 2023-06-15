// import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import { BrowserRouter as Router } from 'react-router-dom';

import Register from './pages/register/Register.jsx';
import Login from './pages/login/Login.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
