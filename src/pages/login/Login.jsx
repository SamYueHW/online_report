import './login.scss';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSignUpClick = async(e) => {
    setIsSignUpMode(true);
    setError(''); // Clear previous error message
   
   
    if (isSignUpMode) {
      e.preventDefault();
    
      try {
        // 验证输入的电子邮件格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || email.length > 45) {
          setError('Please check your email');
          return;
        }

        // 验证输入的密码长度
        if (password.length > 25) {
          setError('Password exceeds the maximum length');
          return;
        }
        if (key.length > 55) {
          setError('Please enter a valid activation key');
          return;
        }
      // 发送加密后的密码到服务器端
        const response = await axios.post(process.env.REACT_APP_SERVER_URL+'/register', { email: email, password: password, activationKey: key }, {
        });
         // 处理登录成功的情况
        // 检查响应
        if (response.status === 200) {
          
          // 在这里使用客户端路由进行导航
          // 如果你使用React Router
          setIsSignUpMode(false)
          navigate('/');

        }
      } catch (error) {
        if (error.response.status === 400) {
          setError('Invalid activation key');
        } else if (error.response.status === 500) {
          setError('An error occurred while registering the user');
        } else {
          setError('Unknown error occurred');
        }
        console.log(error);
        
      }
    }
  };
  function clearCookie(cookieName) {
    document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
  const handleSignInClick = async (e) => {
    setIsSignUpMode(false);
    setError(''); // Clear previous error message
    // clearCookie('sessionId');


    if (!isSignUpMode) {
      
      e.preventDefault();
      try {
        // 验证输入的电子邮件格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || email.length > 45) {
          setError('Please check your email');
          return;
        }

        // 验证输入的密码长度
        if (password.length > 25) {
          setError('Password exceeds the maximum length');
          return;
        }
        
      // 发送加密后的密码到服务器端
        const response = await axios.post(process.env.REACT_APP_SERVER_URL+'/login', { email: email, password: password}, { withCredentials: true });
        // 处理登录成功的情况
        if (response.status === 200) {
          
          const token = response.data.token;
          // 存储JWT到sessionStorage
          sessionStorage.setItem('jwtToken', token);
         
          navigate('/checkStores');
          
        }
      } catch (error) {
        // 处理登录失败的情况
      setError('An error occurred during login');
    }
    }
  };

  return ( <div className={`bodycontainer ${isSignUpMode ? 'sign-up-mode' : ''}`}>
  <div className="forms-container">
    <div className="signin-signup">
      <form className="sign-in-form" onSubmit={handleSignInClick}>
        <h2 className="title">Sign In</h2>
        <div className="input-field">
          <i className='bx bxs-envelope'></i>
          <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="input-field">
          <i className='bx bxs-lock-alt'></i>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="error-message">{error}</div>}
        <input type="submit" value="Login" className="btn solid" />
      </form>
      <form className="sign-up-form" onSubmit={handleSignUpClick}>
        <h2 className="title">Sign Up</h2>
       
        <div className="input-field">
          <i className='bx bxs-envelope'></i>
          <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="input-field">
          <i className='bx bxs-lock-alt'></i>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="input-field">
          <i className='bx bxs-key'></i>
          <input type="text" placeholder="Activation key" value={key} onChange={(e) => setKey(e.target.value)} />
        </div>
        {error && <div className="error-message">{error}</div>}
        <input type="submit" value="Sign Up" className="btn solid" />
      </form>
    </div>
  </div>
  <div className="panels-container">
    <div className="panel left-panel">
      <div className="content">
        <h3>New here?</h3>
        <p>WELCOME TO ONLINE REPORT</p>
        <button className="btn transparent" onClick={handleSignUpClick}>
          Sign up
        </button>
      </div>
      <img src="/images/Profiling_Monochromatic.png" className="image" alt="" />
    </div>
    <div className="panel right-panel">
      <div className="content">
        <h3>One of us?</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora, illo. Vitae, nesciunt.</p>
        <button className="btn transparent" onClick={handleSignInClick}>
          Sign in
        </button>
      </div>
      <img src="/images/Authentication_Outline.png" className="image" alt="" />
    </div>
  </div>
</div>
  );
};

export default Login;
