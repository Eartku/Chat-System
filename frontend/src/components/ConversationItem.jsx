// Màu avatar dựa theo hash tên để luôn nhất quán
const AVATAR_COLORS = ['accent', 'green', 'orange', 'purple', 'red'];
function getAvatarColor(name = '') {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getDisplayName(conversation) {
  if (conversation.type === 'GROUP') return conversation.name || 'Nhóm chat';
  return conversation.name || 'Tin nhắn riêng';
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

export default function ConversationItem({ conversation, selected, onClick }) {
  const name = getDisplayName(conversation);
  const color = getAvatarColor(name);

  return (
    <button
      type="button"
      className={`conv-item${selected ? ' active' : ''}`}
      onClick={onClick}
    >
      <div className={`conv-avatar ${color}`}>
        {conversation.image ? (
          <img src={conversation.image} alt={name} />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="conv-info">
        <div className="conv-name-row">
          <span className="conv-name">{name}</span>
          <span className="conv-time">{formatTime(conversation.updatedAt)}</span>
        </div>
        <div className="conv-preview">{conversation.lastMessage || 'Chưa có tin nhắn'}</div>
      </div>
    </button>
  );
}