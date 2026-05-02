function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageItem({ message, currentUserId }) {
  const isOwn = message.senderId === currentUserId;
  const isDeleted = message.deleted;
  const content = isDeleted ? 'Tin nhắn đã bị xóa' : message.content;

  return (
    <div className={`message-row${isOwn ? ' own' : ''}`}>
      {!isOwn && (
        <div className="message-sender-avatar">
          {message.senderName ? message.senderName.charAt(0).toUpperCase() : '?'}
        </div>
      )}

      <div className={`message-bubble${isOwn ? ' own' : ' other'}${isDeleted ? ' deleted' : ''}`}>
        {content}
        <div className="message-meta">
          {message.edited && !isDeleted && (
            <span className="message-edited">đã sửa ·</span>
          )}
          <span className="message-time">{formatTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}