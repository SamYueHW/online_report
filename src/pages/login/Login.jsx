import './login.scss';
import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUpClick = () => {
    setIsSignUpMode(true);
  };

  const handleSignInClick = () => {
    setIsSignUpMode(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/login', { username, password });
      // 处理登录成功的情况
      console.log(response.data);
    } catch (error) {
      // 处理登录失败的情况
      console.error(error);
    }
  };

  return (
    <div className={`container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
      <div className="forms-container">
        <div className="signin-signup">
          <form className="sign-in-form" onSubmit={handleLogin}>
            <h2 className="title">Sign In</h2>
            <div className="input-field">
              <i className='bx bxs-user'></i>
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="input-field">
              <i className='bx bxs-lock-alt'></i>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <input type="submit" value="Login" className="btn solid" />
          </form>
          <form className="sign-up-form">
            <h2 className="title">Sign Up</h2>
            <div className="input-field">
              <i className='bx bxs-user'></i>
              <input type="text" placeholder="Username" />
            </div>
            <div className="input-field">
              <i className='bx bxs-envelope'></i>
              <input type="text" placeholder="Email" />
            </div>
            <div className="input-field">
              <i className='bx bxs-lock-alt'></i>
              <input type="password" placeholder="Password" />
            </div>
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
