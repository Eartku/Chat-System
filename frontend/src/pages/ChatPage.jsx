import { useEffect, useMemo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice.js';
import {
  fetchConversations,
  selectConversation,
  fetchConversationDetail,
  createConversation,
  updateConversationLastMessage,
} from '../store/conversationSlice.js';
import { fetchMessages, sendMessage, addMessage } from '../store/messageSlice.js';
import ConversationList from '../components/ConversationList.jsx';
import MessageList from '../components/MessageList.jsx';
import MessageInput from '../components/MessageInput.jsx';
import CreateConversationModal from '../components/CreateConversationModal.jsx';
import useWebSocket from '../hooks/useWebSocket.js';

export default function ChatPage() {
  const dispatch = useDispatch();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, token } = useSelector((s) => s.auth);
  const {
    conversations,
    selectedConversation,
    selectedConversationDetail,
    loading: conversationsLoading,
  } = useSelector((s) => s.conversation);
  const { messagesByConversation, loading: messagesLoading } = useSelector((s) => s.message);

  const messages = useMemo(
    () => messagesByConversation[selectedConversation] || [],
    [messagesByConversation, selectedConversation]
  );

  const selectedConversationData = useMemo(() => {
    if (selectedConversationDetail) return selectedConversationDetail;
    return conversations.find((c) => c.id === selectedConversation) || null;
  }, [selectedConversationDetail, conversations, selectedConversation]);

  const handleSelectConversation = useCallback(
    (id) => {
      console.debug('[ChatPage] selectConversation', { id });
      dispatch(selectConversation(id));
      dispatch(fetchConversationDetail(id));
      dispatch(fetchMessages(id));
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      handleSelectConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation, handleSelectConversation]);

  const handleSendMessage = async (content) => {
    if (!selectedConversation || !user) return;

    const tempId = `temp-${Date.now()}`;
    dispatch(addMessage({
        messId: tempId,
        conversationId: selectedConversation,
        senderId: user.id,
        senderName: user.username,
        content,
        createdAt: new Date().toISOString(),
        deleted: false,
        edited: false,
    }));

    console.debug('[ChatPage] sendMessage', { conversationId: selectedConversation, content });
    const result = await dispatch(sendMessage({ conversationId: selectedConversation, content }));

    if (result.error) {
        console.error('[ChatPage] sendMessage failed', result.error);
        dispatch(removeMessage({ conversationId: selectedConversation, messId: tempId }));
    }
};

  // ✅ FIX: Dùng String() để tránh type mismatch (WS trả string "1", Redux lưu number 1)
  const handleNewWebSocketMessage = useCallback(
    (payload) => {
      if (!payload.conversationId) return;
      const conversationIdString = String(payload.conversationId);
      const selectedIdString = String(selectedConversation || '');
      dispatch(addMessage(payload));
      dispatch(
        updateConversationLastMessage({
          conversationId: payload.conversationId,
          content: payload.deleted ? 'Đã xóa' : payload.content,
          createdAt: payload.createdAt
        })
      );
      if (conversationIdString !== selectedIdString) {
        return;
      }
    },
    [dispatch, selectedConversation]
  );

  useWebSocket(selectedConversation, token, handleNewWebSocketMessage);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  const conversationLabel = useMemo(() => {
    if (!selectedConversationData) return 'Chọn cuộc trò chuyện';
    if (selectedConversationData.type === 'GROUP') {
      return selectedConversationData.name || 'Nhóm chat';
    }
    if (selectedConversationData.name) return selectedConversationData.name;
    if (selectedConversationData.members?.length) {
      const other = selectedConversationData.members.find((m) => m.userId !== user?.id);
      return other?.username || 'Cuộc trò chuyện riêng';
    }
    return 'Cuộc trò chuyện riêng';
  }, [selectedConversationData, user]);

  const avatarLetter = conversationLabel ? conversationLabel.charAt(0).toUpperCase() : '?';

  return (
    <div className="chat-root">
      {/* Top bar */}
      <header className="chat-topbar">
        <div className="chat-topbar__brand">
          <div className="chat-topbar__logo">💬</div>
          <div>
            <div className="chat-topbar__title">ChatApp</div>
            <div className="chat-topbar__subtitle">{user?.username}</div>
          </div>
        </div>
        <div className="chat-topbar__actions">
          <button className="btn btn-outline btn-sm" onClick={() => setShowCreateModal(true)}>
            + Cuộc trò chuyện
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="chat-body">
        {/* Sidebar */}
        <aside className="chat-sidebar">
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation}
            onSelectConversation={handleSelectConversation}
            loading={conversationsLoading}
          />
        </aside>

        {/* Main */}
        <main className="chat-main">
          {/* Chat header */}
          <div className="chat-header">
            {selectedConversationData ? (
              <>
                <div className="chat-header__avatar">{avatarLetter}</div>
                <div className="chat-header__info">
                  <div className="chat-header__name">{conversationLabel}</div>
                  <div className="chat-header__sub">
                    {selectedConversationData?.lastMessage || 'Bắt đầu cuộc trò chuyện'}
                  </div>
                </div>
              </>
            ) : (
              <div className="chat-header__name" style={{ color: 'var(--text-tertiary)' }}>
                Chọn một cuộc trò chuyện
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="messages-area">
            <MessageList
              messages={messages}
              currentUserId={user?.id}
              loading={messagesLoading}
            />
          </div>

          {/* Input */}
          <MessageInput onSend={handleSendMessage} disabled={!selectedConversation} />
        </main>
      </div>

      <CreateConversationModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={async (payload) => {
          await dispatch(createConversation(payload));
          setShowCreateModal(false);
        }}
        currentUserId={user?.id}
      />
    </div>
  );
}