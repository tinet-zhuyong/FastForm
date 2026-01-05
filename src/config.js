// API配置
export const API_CONFIG = {
  baseURL: 'https://dev.publicform.com',
  timeout: 2000, // 2秒超时
};

// 表单相关API
export const WEBAPI = {
  create: `${API_CONFIG.baseURL}/api/forms/create`,
};
