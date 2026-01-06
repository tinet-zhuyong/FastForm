/**
 * 认证工具函数
 */

// 存储用户信息到 localStorage
export const setUserInfo = (userInfo) => {
  localStorage.setItem('userId', userInfo.userId);
  localStorage.setItem('username', userInfo.username);
  localStorage.setItem('email', userInfo.email || '');
  localStorage.setItem('role', userInfo.role || 'normal');
  localStorage.setItem('token', userInfo.token);
};

// 获取用户信息
export const getUserInfo = () => {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  if (!userId || !token) {
    return null;
  }

  return {
    userId,
    username,
    email,
    role,
    token,
  };
};

// 清除用户信息
export const clearUserInfo = () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  localStorage.removeItem('role');
  localStorage.removeItem('token');
};

// 检查是否已登录
export const isAuthenticated = () => {
  return !!getUserInfo();
};

// 获取用户 ID
export const getUserId = () => {
  return localStorage.getItem('userId');
};

// 获取 token
export const getToken = () => {
  return localStorage.getItem('token');
};
