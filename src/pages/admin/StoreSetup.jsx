import React from "react";
import Adminsidebar from "../../components/sidebar/Adminsidebar";
import axios from "axios";
import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import moment from 'moment-timezone';
import useGetState from '../../hooks/useGetState';
import { CircularProgress } from '@mui/material';
import './admindashboard.scss';

const StoreSetup = ({ }) => {

    const navigate = useNavigate();
    const australiaDate =  moment.tz('Australia/Sydney').format('YYYY-MM-DD');

    const [user, setUser, getUser] = useGetState(null);
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const handleLogout = async () => {
        try {
          await axios.get(process.env.REACT_APP_SERVER_URL + '/logout', { withCredentials: true });
          sessionStorage.removeItem('jwtToken');
          navigate('/');
        } catch (error) {
          console.log(error);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
          try {
            const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
            const config = {
                headers: {
                'authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(process.env.REACT_APP_SERVER_URL + '/dashboard', { ...config, withCredentials: true });
            
            if (response)
            setDashboard_data(response.data.store_data);
            setIsLoading(false);
            setIsAdmin(response.data.isAdmin);
            console.log(response.data.store_data);
          } catch (error) {
            console.log(error);
          }
        };
    
        fetchDashboardData();
      }, []);





};
export default StoreSetup;

