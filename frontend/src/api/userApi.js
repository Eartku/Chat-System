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

export function updateProfile(id, payload){
  return axiosInstance.put(`/user/${id}`, payload).then((res) => res.data);
}

export function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance
    .post('/upload/avatar', formData, {
      headers: { 'Content-Type': undefined }  // để axios tự set multipart + boundary
    })
    .then((res) => res.data);
}
 

