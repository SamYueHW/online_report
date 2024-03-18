import styles from './login.module.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const registerAsync = async () => {
    
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
      const response = await axios.post(process.env.REACT_APP_SERVER_URL+'/register', { email: email, password: password, activationKey: key, name: name }, {
      });
        // 处理登录成功的情况
      // 检查响应
      if (response.status === 200) {
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
  };
    const signInAsync = async () => {
     
      
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
        const response = await axios.post(process.env.REACT_APP_SERVER_URL+'/login', { email: email, password: password});
        // 处理登录成功的情况
        if (response.status === 200) {
          
          const token = response.data.token;
          // 存储JWT到sessionStorage
          sessionStorage.setItem('jwtToken', token);
          if (response.data.isAdmin) {
           
            navigate('/admin-dashboard');
          } else {
            navigate('/checkStores');
          }
        }
      } catch (error) {
        // 处理登录失败的情况
      setError('An error occurred during login');
    }
    };


  const handleSignUpClick = async(e) => {
    e.preventDefault();
    setIsSignUpMode(true);
    setError(''); // Clear previous error message
    registerAsync();
    
  };

  const handleSignInClick = async (e) => {
    e.preventDefault();
    setIsSignUpMode(false);
    setError(''); // Clear previous error message
    signInAsync();
  
  };
  useEffect(() => {
    sessionStorage.removeItem('jwtToken');
    localStorage.removeItem('jwtToken');
    // 其他的初始化代码
  }, []); // 空的依赖数组表示这个 useEffect 只会在组件挂载时运行
  

  return (
    <div className={`${styles.bodycontainer} ${isSignUpMode ? styles.signUpMode : ''}`}>
      <div className={styles.formsContainer}>
        <div className={styles.signinSignup}>
          <form className={styles.signInForm} onSubmit={handleSignInClick}>
            <h2 className={styles.title}>Sign In</h2>
            <div className={styles.inputField}>
              <i className='bx bxs-envelope'></i>
              <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className={styles.inputField}>
              <i className='bx bxs-lock-alt'></i>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <input type="submit" value="Login" className={[styles.btn, styles.solid].join(' ')} />
          </form>
          <form className={styles.signUpForm} onSubmit={handleSignUpClick}>
            <h2 className={styles.title}>Sign Up</h2>
            <div className={styles.inputField}>
              <i className='bx bxs-envelope'></i>
              <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className={styles.inputField}>
              <i className='bx bxs-lock-alt'></i>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className={styles.inputField}>
              <i className='bx bxs-user'></i> {/* 更改图标为用户图标，或者你可以保留锁图标，取决于你的需要 */}
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className={styles.inputField}>
              <i className='bx bxs-key'></i>
              <input type="text" placeholder="Activation key" value={key} onChange={(e) => setKey(e.target.value)} />
            </div>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <input type="submit" value="Sign Up" className={[styles.btn, styles.solid].join(' ')} />

          </form>
        </div>
      </div>
      <div className={styles.panelsContainer}>
      <div className={[styles.panel, styles.leftPanel].join(' ')}>
        
          <div className={styles.content}>
            <h3>New here?</h3>
            <p>WELCOME TO ONLINE REPORT</p>
            <button className={[styles.btn, styles.transparent].join(' ')} onClick={handleSignUpClick}>
              Sign up
            </button>
          </div>
          <img src="/images/Profiling_Monochromatic.png" className={styles.image} alt="" />
        </div>
        <div className={[styles.panel, styles.rightPanel].join(' ')}>
          <div className={styles.content}>
            <h3>One of us?</h3>
            <p>Welcome to Enrich Online Report</p>
            <button className={[styles.btn, styles.transparent].join(' ')} onClick={handleSignInClick}>
              Sign in
            </button>
          </div>
          <img src="/images/Authentication_Outline.png" className={styles.image} alt="" />
        </div>
      </div>
    </div>
  );
  
};

export default Login;
