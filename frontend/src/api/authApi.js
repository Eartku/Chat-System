import axiosInstance from './axiosInstance.js';

export function login(payload) {
  return axiosInstance.post('/auth/login', payload).then((res) => res.data);
}

export function register(payload) {
  return axiosInstance.post('/auth/register', payload).then((res) => res.data);
}

export function fetchMe() {
  return axiosInstance.get('/auth/me').then((res) => res.data);
}
