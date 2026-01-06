// API配置
export const API_CONFIG = {
  baseURL: 'http://localhost:3000',
  timeout: 10000, // 10秒超时
};

// 表单相关API
export const WEBAPI = {
  // 表单
  createForm: `${API_CONFIG.baseURL}/api/surveys`,
  getAllForms: `${API_CONFIG.baseURL}/api/surveys`,
  getFormById: (id) => `${API_CONFIG.baseURL}/api/surveys/${id}`,
  getFormByUrl: (url) => `${API_CONFIG.baseURL}/api/surveys/url/${url}`,
  updateForm: (id) => `${API_CONFIG.baseURL}/api/surveys/${id}`,
  deleteForm: (id) => `${API_CONFIG.baseURL}/api/surveys/${id}`,
  getFormAnalytics: (id) => `${API_CONFIG.baseURL}/api/surveys/${id}/analytics`,
  
  // 表单提交
  submitForm: `${API_CONFIG.baseURL}/api/submissions`,
  getFormSubmissions: (formId) => `${API_CONFIG.baseURL}/api/submissions/form/${formId}`,
  getFormSubmissionStats: (formId) => `${API_CONFIG.baseURL}/api/submissions/form/${formId}/stats`,
  
  // 用户
  login: `${API_CONFIG.baseURL}/api/users/login`,
  register: `${API_CONFIG.baseURL}/api/users/register`,
  profile: `${API_CONFIG.baseURL}/api/users/profile`,
};
