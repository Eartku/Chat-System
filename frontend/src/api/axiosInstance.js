import axios from 'axios';

const API_BASE_URL = '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

function clearAuth() {
  localStorage.removeItem('token');
  window.location.href = '/login';
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
    if (error.response?.status === 401) {
      clearAuth();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
