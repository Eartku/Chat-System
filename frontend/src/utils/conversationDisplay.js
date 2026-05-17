import { getAvatarFallback, getResolvedAvatarUrl } from './avatar.js';

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function getUserDisplayName(user) {
  return normalizeText(user?.displayName) || normalizeText(user?.username);
}

export function isPrivateConversation(conversation) {
  return conversation?.type === 'PRIVATE';
}

export function getPrivateConversationMember(conversation, currentUserId) {
  if (!conversation?.members?.length) {
    return null;
  }

  return (
    conversation.members.find((member) => Number(member.userId) !== Number(currentUserId)) || null
  );
}

export function getConversationDisplayName(conversation, currentUserId) {
  if (!conversation) {
    return 'Chọn cuộc trò chuyện';
  }

  if (!isPrivateConversation(conversation)) {
    return normalizeText(conversation.name) || 'Nhóm chat';
  }

  const otherMember = getPrivateConversationMember(conversation, currentUserId);
  return (
    getUserDisplayName(otherMember) ||
    normalizeText(conversation.name) ||
    'Cuộc trò chuyện riêng'
  );
}

export function getConversationAvatarUrl(conversation, currentUserId) {
  if (!conversation) return '';
  if (!isPrivateConversation(conversation)) {
    return normalizeText(conversation.image);
  }
  
  const otherMember = getPrivateConversationMember(conversation, currentUserId);
  console.log('[avatarUrl] otherMember =', JSON.stringify(otherMember, null, 2));
  return normalizeText(otherMember?.avatarUrl); // ← trả về '' nếu không có ảnh
}

export function getConversationAvatarFallback(conversation, currentUserId) {
  return getAvatarFallback(getConversationDisplayName(conversation, currentUserId));
}

export function isConversationOnline(conversation, currentUserId) {
  if (!isPrivateConversation(conversation)) {
    return false;
  }

  return Boolean(getPrivateConversationMember(conversation, currentUserId)?.online);
}

export function getConversationStatusText(conversation, currentUserId) {
  if (!conversation) {
    return '';
  }

  if (!isPrivateConversation(conversation)) {
    const memberCount = conversation.members?.length || 0;
    return memberCount > 0 ? `${memberCount} thành viên` : 'Nhóm chat';
  }

  return isConversationOnline(conversation, currentUserId)
    ? 'Đang hoạt động'
    : 'Không hoạt động';
}

export function getConversationMetaText(conversation, currentUserId) {
  if (!conversation) {
    return '';
  }

  if (!isPrivateConversation(conversation)) {
    return normalizeText(conversation.lastMessage) || 'Bắt đầu cuộc trò chuyện';
  }

  const otherMember = getPrivateConversationMember(conversation, currentUserId);
  const username = normalizeText(otherMember?.username);
  return username ? `@${username}` : 'Cuộc trò chuyện riêng';
}

export function getConversationPreviewText(conversation, currentUserId) {
  const lastMessage = normalizeText(conversation?.lastMessage);
  if (lastMessage) {
    return lastMessage;
  }

  if (isPrivateConversation(conversation)) {
    return getConversationStatusText(conversation, currentUserId);
  }

  return 'Chưa có tin nhắn';
}
