import axios from "axios";
import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGetState from '../../hooks/useGetState';
import { CircularProgress } from '@mui/material';
import Sidebar from '../../components/sidebar/Sidebarnew';
import moment from 'moment-timezone';
import './WeeklySales.scss';
import SalesAnalysisTable from '../../components/table/SalesAnalysisTable';
import SalesAnalysisGPTable from '../../components/table/SalesAnalysisGPTable';

import DateRangePickerValue from "../../components/datepicker/Datepicker";



const WeeklySales = () => {
  const [user, setUser, getUser] = useGetState(null);
  const [isUserFetched, setIsUserFetched, getIsUserFetched] = useGetState(false);
  const [isAdmin, setIsAdmin, getIsAdmin] = useGetState(false);
  const [isLoading, setIsLoading, getIsLoading] = useGetState(true);
  const [weeklySales, setWeeklySales] = useState([]);
  const navigate = useNavigate();
  const [activeTable, setActiveTable] = useState(null);  // 'sales' for Sales Analysis, 'gp' for GP Analysis, null for none
  const showSalesAnalysis = () => {
    setActiveTable('sales');
  };
  
  const showGpAnalysis = () => {
    setActiveTable('gp');
  };
  function formatDateTime(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 如果小时为0，则转换为12
  
    return `${day}/${month}/${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }
  


  const [storeName, setStoreName] = useState(null);
  const [lastestUpdate, setLastestUpdate] = useState(null);

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  // 用于保存表单输入的状态
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: ''
  });

  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [passwordMismatchWarning, setPasswordMismatchWarning] = useState(false); // 新增状态
  
  const [hasBranch, setHasBranch] = useState(false);
  const [posVersion, setPosVersion] = useState(null);
  const australiaMoment = moment.tz('Australia/Sydney'); // 获取澳大利亚悉尼时区的当前日期和时间
  const [selectedDate, setSelectedDate] = useState(australiaMoment.clone().startOf('isoWeek').format('YYYY-MM-DD'));
  const [totalNetSalesWithDate, setTotalNetSalesWithDate] = useState(null);
  // 新增函数，用于检查密码是否匹配
  const checkPasswordsMatch = () => {
    if (passwordData.newPassword !== confirmPassword) {
      setPasswordMismatchWarning(true);
    } else {
      setPasswordMismatchWarning(false);
    }
  };
  const hasNonEmptyWeeklySales = (weeklySales) => {
    for (let week of weeklySales) {
      const weekData = Object.values(week)[0];
      if (weekData && Object.keys(weekData).length > 0) {
        return true;
      }
    }
    return false;
  };
  
  
  
  const handleLogout = async () => {
    try {
      await axios.get(process.env.REACT_APP_SERVER_URL + '/logout', { withCredentials: true });
      setUser(null);
      sessionStorage.removeItem('jwtToken');
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  // 处理密码更改表单的提交
  const handleChangePassword = async () => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_SERVER_URL + '/updatePassword', 
        passwordData,
        {
          headers: {
            'authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`
          },
          withCredentials: true
        }
      );
      if (response.status === 200) {
        alert('Password changed successfully');
        setIsChangePasswordModalOpen(false);
        handleLogout();
      } else {
        alert('Failed to change the password');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to change the password');
    }
  };
  
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 935);

  useEffect(() => {
      const handleResize = () => {
      setShowSidebar(window.innerWidth > 935);
      };
      window.addEventListener('resize', handleResize);
      return () => {
      window.removeEventListener('resize', handleResize);
      };
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('jwtToken');
        const config = {
          headers: {
            'authorization': `Bearer ${token}`
          }
        };
        const params = {
          selectedDate: selectedDate
        };
        const response = await axios.get(process.env.REACT_APP_SERVER_URL + '/weeklysales',{
          ...config,
          params,
          withCredentials: true
        });

        if (response.status === 200) {

          setWeeklySales(response.data.results);
          setHasBranch(response.data.hasBranchResult);

          setPosVersion(response.data.posVersion['PosVersion']);
          setIsAdmin(response.data.isAdmin);
          setIsUserFetched(true);
          setIsLoading(false);
          setUser(response.data.ClientNameResult);
          setStoreName(response.data.StoreName);
          setLastestUpdate(formatDateTime(response.data.LastestReportUpdateTimeResult));
          setTotalNetSalesWithDate(response.data.TotalNetSalesWithDate);
          
        } else {
          //navigate('/');
          console.log('Failed to fetch data');
        }
      } catch (error) {
        navigate('/');
        console.log(error);
      }
    };
    fetchData();
  }, []);
  const handleDateChange = (newDate) => {
    const formattedDate = moment(newDate).startOf('isoWeek').format('YYYY-MM-DD');

    
    setSelectedDate(formattedDate);
    // 在这里，您也可以设置一个新的状态，以显示日期范围（周一到周日）
  };

  
  const handleSearch = async () => {

   
    // 构造请求参数
    const params = {
      selectedDate: selectedDate,
      
    };
  
    // 发送 GET 请求
    try {

      const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token

      const config = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      
      const response = await axios.get(process.env.REACT_APP_SERVER_URL + '/weeklysales', {
        ...config,
        params,
        withCredentials: true
      });
      // 处理响应结果
      if (response.status === 200) {
        
          setWeeklySales(response.data.results);
          setHasBranch(response.data.hasBranchResult);

          setPosVersion(response.data.posVersion['PosVersion']);
          setIsAdmin(response.data.isAdmin);
          setIsUserFetched(true);
          setIsLoading(false);
          setUser(response.data.ClientNameResult);
          setStoreName(response.data.StoreName);
          setLastestUpdate(formatDateTime(response.data.LastestReportUpdateTimeResult));
          setTotalNetSalesWithDate(response.data.TotalNetSalesWithDate);
        
      }
    } catch (error) {
      console.log(error);
      navigate('/');
      
    }
  };


  useEffect(() => {
      if (getIsUserFetched() && !getIsAdmin() ) {
        setIsLoading(false);
      }
    }, [getIsUserFetched(), getIsAdmin()]);
  
  if (getIsLoading()) {
      return (
        <div className="loading-overlay">
          <CircularProgress className="loading-spinner" />
        </div>
      );
    } 
  
  else if(!getIsLoading() && !getIsAdmin() ){
      return( 
          <div className="container">
              <div className="sider">
                <Sidebar key={hasBranch ? 'true' : 'false'} user={getUser()} onLogout={handleLogout} showSidebar={showSidebar} setShowSidebar={setShowSidebar}  hasBranch={hasBranch}  isChangePasswordModalOpen={isChangePasswordModalOpen} posVersion={posVersion}
                setIsChangePasswordModalOpen={setIsChangePasswordModalOpen}/>
                  {isChangePasswordModalOpen && (
                  <div className="modal-overlay">
                    <div className="modal">
                      <h2>Change Password</h2>
                      <label>
                        Old Password: <input type="password" style={{ width: '150px' }} value={passwordData.oldPassword} 
                              onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} />
                      </label>
                      <label>
                        New Password: <input 
                          type="password" 
                          style={{ width: '150px' }} 
                          value={passwordData.newPassword} 
                          onChange={(e) => {
                            setPasswordData({ ...passwordData, newPassword: e.target.value });
                            checkPasswordsMatch();  // 在这里也检查密码是否匹配
                          }} 
                        />
                      </label>
                      <label>
                        Confirm Password: <input type="password" style={{ width: '150px' }} value={confirmPassword} 
                              onChange={(e) => { 
                                setConfirmPassword(e.target.value);
                                checkPasswordsMatch(); // 检查密码是否匹配
                              }} />
                      </label>
                      {passwordMismatchWarning && <span style={{ color: 'red' }}>Passwords do not match</span>}
                      <button className='change-pass' onClick={handleChangePassword}>Submit</button>
                      <button className='change-pass' onClick={() => setIsChangePasswordModalOpen(false)}>Cancel</button>
                    </div>
                  </div>
                  )}
              </div>
              <div className='main-layout'>
                <div className="header">
                  <button id ="menu-btn"  onClick={() => setShowSidebar(true)}>
                      <span className='material-icons-sharp'>menu</span>
                  </button>
                  <div className='top'>

                    {/* <div className='theme-toggler' onClick={handleThemeToggle}>
                    <span className='material-icons-sharp active'>light_mode</span>
                    <span className='material-icons-sharp'>dark_mode</span>
                    </div> */}
                    <div className='profile'>
                      <div className='info'>
                        <p>Hey, <b>{getUser()}</b> [{storeName}]</p>
                        <small className='text-muted'>Last Updates: {lastestUpdate}</small>
                      </div>  
                      <div className='profile-photo'>
                        <img src='./images/enrichIcon.jpg' />
                      </div>
                    </div>
                  </div>   
                </div>
                <div className='content'>
                  <main className='main-content' >
                    <div className='zdy-h'></div>
                    <div className='main'>
                      <h1>Weekly Sales Analysis</h1>
                      <div className="date_mui">
                      <DateRangePickerValue defaultDate={moment(australiaMoment).day(australiaMoment.day() === 0 ? -6 : 1).startOf('week')} onDateChange={handleDateChange} />
                      <button className="ripple" onClick={handleSearch}>Search</button>
                      </div>
                     <div className="tab-container" style={{ marginBottom: '100px' }}>
                        <div className="table_container">  {/* 新的外部容器 */}
                        <button onClick={showSalesAnalysis} className="analysis-button">Sales Analysis</button>
                        <button onClick={showGpAnalysis} className="analysis-button">GP Analysis</button>
                      
                        <div className="table-scrollable-container">  {/* 新的外部容器 */}
                        {activeTable === 'sales' && hasNonEmptyWeeklySales(weeklySales) && (
                          <SalesAnalysisTable data={weeklySales} totalNetSales={[totalNetSalesWithDate]}/>
                        )}
                        {activeTable === 'gp' && hasNonEmptyWeeklySales(weeklySales) && (
                          <SalesAnalysisGPTable data={weeklySales} />
                        )}

                      </div>
  
                    </div>
                    </div>

                      
                    </div>



                  </main>
                </div>

              </div>
                  
          </div>

          




      )
  };
};
    
export default WeeklySales;