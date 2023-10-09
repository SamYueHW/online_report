import React from "react";
import Adminsidebar from "../../components/sidebar/Adminsidebar";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import moment from 'moment-timezone';
import useGetState from '../../hooks/useGetState';
import { CircularProgress } from '@mui/material';
import './admindashboard.scss';

const AdminCRM = ({ }) => {
    const navigate = useNavigate();
    return (
        <div className="dashboard">
            <Adminsidebar />
            <div className="home_content">
                <div className="text">Welcome to Admin CRM</div>
            </div>
        </div>
    );

}
export default AdminCRM;
