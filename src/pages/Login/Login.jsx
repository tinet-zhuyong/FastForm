import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // 模拟登录逻辑
    console.log('Login attempt:', { email, password });
    // 登录成功后跳转到 /space
    navigate('/space');
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="logo">📋</div>
        <h1>Fast Form</h1>
        <p className="login-subtitle">登录您的账号</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="请输入您的邮箱"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="请输入您的密码"
            />
          </div>
          <button type="submit" className="login-button">登录</button>
        </form>
        <div className="login-footer">
          <p>还没有账号？<a href="#">立即注册</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;