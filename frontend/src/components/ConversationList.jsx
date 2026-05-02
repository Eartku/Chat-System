import ConversationItem from './ConversationItem.jsx';

export default function ConversationList({ conversations, selectedId, onSelectConversation, loading }) {
  return (
    <div className="chat-sidebar" style={{ width: '100%' }}>
      <div className="sidebar-header">
        <span className="sidebar-header__title">Tin nhắn</span>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          {conversations.length > 0 ? `${conversations.length} cuộc trò chuyện` : ''}
        </span>
      </div>

      <div className="sidebar-list">
        {loading && (
          <div className="state-center" style={{ padding: '32px 0' }}>
            <div className="spinner" />
            <span>Đang tải...</span>
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="state-center" style={{ padding: '40px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
            <span>Chưa có cuộc trò chuyện nào</span>
          </div>
        )}

        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            selected={conversation.id === selectedId}
            onClick={() => onSelectConversation(conversation.id)}
          />
        ))}
      </div>
    </div>
  );
}