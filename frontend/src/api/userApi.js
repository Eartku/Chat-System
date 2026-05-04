import axiosInstance from './axiosInstance.js';

export function searchUsers(query) {
  return axiosInstance.get('/user/search', { params: { query } }).then((res) => res.data);
}

export function getAllUsers() {
  return axiosInstance.get('/user').then((res) => res.data);
}

export function getUserById(id) {
  return axiosInstance.get(`/user/${id}`).then((res) => res.data);
}
