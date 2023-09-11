import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar/Sidebarnew';
import useGetState from '../../hooks/useGetState';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CheckStores = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser, getUser] = useGetState(null);


  const [stores, setStores] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get(process.env.REACT_APP_SERVER_URL + '/logout', { withCredentials: true });
      sessionStorage.removeItem('jwtToken');
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  const handleStoreSelect = async (storeId) => {
    try {
      const token = sessionStorage.getItem('jwtToken');
      const config = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };

      const response = await axios.post(process.env.REACT_APP_SERVER_URL + '/selectStore', {storeId}, config);

       if (response.status === 200 && response.data.success) {
          if (response.data.newJwt) {
            sessionStorage.setItem('jwtToken', response.data.newJwt);
          }
          const newtoken = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
          const newconfig = {
            headers: {
              'authorization': `Bearer ${newtoken}`
            }
          };
          
          const response2 = await axios.post(process.env.REACT_APP_SERVER_URL+'/checkStores', {}, newconfig); // 发送请求到服务器
        
          if (response2.status === 200 && response2.data.success) {
            {
              navigate('/dashboard');
            }
          } 
          else{
            handleLogout();
          }

        } 
    } catch (error) {
      console.error('Error selecting the store', error);
    }
  };

  useEffect(() => {
    const fetchStores = async () => {
        try {

            const token = sessionStorage.getItem('jwtToken'); // 从 sessionStorage 获取 JWT Token
            const config = {
              headers: {
                'authorization': `Bearer ${token}`
              }
            };
           
            const response = await axios.post(process.env.REACT_APP_SERVER_URL+'/checkStores', {}, config); // 发送请求到服务器
          
            if (response.status === 200 && response.data.success) {
              {
                navigate('/dashboard');
              }
            } 
            else if (response.status === 201 && response.data.success) {
                if (response.data.stores) {
                    setStores(response.data.stores); // 如果有多个商店，设置商店名称
                }
            }
            
            else if (response.status === 401 || response.status === 500) {
              handleLogout(); // 如果状态码是 401（未授权）或 500（服务器内部错误），执行注销操作
            }
          
          } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 500)) {
              handleLogout(); // 如果状态码是 401（未授权）或 500（服务器内部错误），执行注销操作
            }
            console.error('There was an error fetching the stores', error);
          }
          
    };

    fetchStores();
  }, []);

  return (
    <div className="container">
      <Sidebar user={getUser()} onLogout={handleLogout} isOpen={isSidebarOpen} />
      <main>
    <div>
      <h1>Check Stores</h1>
      {stores ? (
         <ul className="check-store-list">
          {stores.map((store) => (
            <li key={store.StoreId}>
              <button className="store-button" onClick={() => handleStoreSelect(store.StoreId)}>
                {store.StoreName}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
    </main>
    </div>
  );
  
};

export default CheckStores;
