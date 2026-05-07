import axios from 'axios';

const API_BASE_URL = '/api';
const AUTH_PAGES = ['/login', '/register'];

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

function isLoginRequest(config) {
  const method = config?.method?.toLowerCase();
  const url = config?.url || '';
  return method === 'post' && (url === '/auth/login' || url.endsWith('/auth/login'));
}

function clearAuth() {
  localStorage.removeItem('token');
  if (!AUTH_PAGES.includes(window.location.pathname)) {
    window.location.href = '/login';
  }
}

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.debug('[Axios] request', {
    method: config.method,
    url: config.baseURL + config.url,
    hasToken: !!token,
    headers: {
      ...config.headers,
      Authorization: config.headers.Authorization ? 'Bearer *****' : undefined
    }
  });
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.debug('[Axios] response', {
      method: response.config.method,
      url: response.config.baseURL + response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[Axios] response error', {
      method: error.config?.method,
      url: error.config?.baseURL + error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    if (error.response?.status === 401 && !isLoginRequest(error.config)) {
      clearAuth();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
