import axiosInstance from './axiosInstance.js';

export function fetchConversations() {
  return axiosInstance.get('/conversations').then((res) => res.data);
}

export function fetchConversationDetail(conversationId) {
  return axiosInstance.get(`/conversations/${conversationId}`).then((res) => res.data);
}

export function createConversation(payload) {
  return axiosInstance.post('/conversations', payload).then((res) => res.data);
}

export function updateConversation(conversationId, payload) {
  return axiosInstance.put(`/conversations/${conversationId}`, payload).then((res) => res.data);
}

export function deleteConversation(conversationId) {
  return axiosInstance.delete(`/conversations/${conversationId}`).then((res) => res.data);
}
