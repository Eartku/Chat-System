import axiosInstance from './axiosInstance.js';

export function fetchMessages(conversationId) {
  return axiosInstance.get(`/conversations/${conversationId}/messages`).then((res) => res.data);
}

export function sendMessage(conversationId, payload) {
  return axiosInstance.post(`/conversations/${conversationId}/messages`, payload).then((res) => res.data);
}

export function editMessage(messageId, payload) {
  return axiosInstance.patch(`/messages/${messageId}`, payload).then((res) => res.data);
}

export function markMessageRead(messageId) {
  return axiosInstance.patch(`/messages/${messageId}/read`).then((res) => res.data);
}

export function deleteMessage(messageId) {
  return axiosInstance.delete(`/messages/${messageId}`).then((res) => res.data);
}
