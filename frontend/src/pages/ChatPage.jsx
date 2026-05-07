import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice.js';
import {
  createConversation,
  fetchConversationDetail,
  fetchConversations,
  selectConversation,
  updateConversationLastMessage,
} from '../store/conversationSlice.js';
import { addMessage, fetchMessages, sendMessage } from '../store/messageSlice.js';
import { logoutRequest } from '../api/authApi.js';
import ConversationList from '../components/ConversationList.jsx';
import CreateConversationModal from '../components/CreateConversationModal.jsx';
import MessageInput from '../components/MessageInput.jsx';
import MessageList from '../components/MessageList.jsx';
import SearchFriendsModal from '../components/SearchFriendsModal.jsx';
import useWebSocket from '../hooks/useWebSocket.js';
import { handleAvatarError } from '../utils/avatar.js';
import {
  getConversationAvatarFallback,
  getConversationAvatarUrl,
  getConversationDisplayName,
  getConversationMetaText,
  getConversationStatusText,
  getUserDisplayName,
  isConversationOnline,
  isPrivateConversation,
} from '../utils/conversationDisplay.js';

export default function ChatPage() {
  const dispatch = useDispatch();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { user, token } = useSelector((state) => state.auth);
  const {
    conversations,
    selectedConversation,
    selectedConversationDetail,
    loading: conversationsLoading,
  } = useSelector((state) => state.conversation);
  const { messagesByConversation, loading: messagesLoading } = useSelector(
    (state) => state.message
  );

  const messages = useMemo(
    () => messagesByConversation[selectedConversation] || [],
    [messagesByConversation, selectedConversation]
  );

  const selectedConversationData = useMemo(() => {
    if (
      selectedConversationDetail &&
      Number(selectedConversationDetail.id) === Number(selectedConversation)
    ) {
      return selectedConversationDetail;
    }

    return (
      conversations.find(
        (conversation) => Number(conversation.id) === Number(selectedConversation)
      ) || null
    );
  }, [conversations, selectedConversation, selectedConversationDetail]);

  const handleSelectConversation = useCallback(
    (conversationId) => {
      console.debug('[ChatPage] selectConversation', { conversationId });
      dispatch(selectConversation(conversationId));
      dispatch(fetchConversationDetail(conversationId));
      dispatch(fetchMessages(conversationId));
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
  }, [conversations, handleSelectConversation, selectedConversation]);

  const handleSendMessage = async (content) => {
    if (!selectedConversation || !user) return;

    console.debug('[ChatPage] sendMessage', { conversationId: selectedConversation, content });
    const result = await dispatch(sendMessage({ conversationId: selectedConversation, content }));

    if (result.error) {
      console.error('[ChatPage] sendMessage failed', result.error);
    }
  };

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
          createdAt: payload.createdAt,
        })
      );

      if (conversationIdString !== selectedIdString) {
        return;
      }
    },
    [dispatch, selectedConversation]
  );

  useWebSocket(selectedConversation, token, handleNewWebSocketMessage);

  const handleCreateConversation = useCallback(
    async (payload) => {
      const conversation = await dispatch(createConversation(payload)).unwrap();
      dispatch(fetchMessages(conversation.id));
      return conversation;
    },
    [dispatch]
  );

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.warn('[ChatPage] logout request failed', error);
    } finally {
      dispatch(logout());
      window.location.href = '/login';
    }
  };

  const conversationLabel = useMemo(
    () => getConversationDisplayName(selectedConversationData, user?.id),
    [selectedConversationData, user?.id]
  );

  const conversationStatus = useMemo(
    () => getConversationStatusText(selectedConversationData, user?.id),
    [selectedConversationData, user?.id]
  );

  const conversationMeta = useMemo(
    () => getConversationMetaText(selectedConversationData, user?.id),
    [selectedConversationData, user?.id]
  );

  const conversationAvatarUrl = useMemo(
    () => getConversationAvatarUrl(selectedConversationData, user?.id),
    [selectedConversationData, user?.id]
  );

  const conversationAvatarFallback = useMemo(
    () => getConversationAvatarFallback(selectedConversationData, user?.id),
    [selectedConversationData, user?.id]
  );

  const privateConversation = useMemo(
    () => isPrivateConversation(selectedConversationData),
    [selectedConversationData]
  );

  const online = useMemo(
    () => isConversationOnline(selectedConversationData, user?.id),
    [selectedConversationData, user?.id]
  );

  const currentUserSubtitle = useMemo(() => {
    if (!user?.username) {
      return '';
    }

    const displayName = getUserDisplayName(user);
    if (displayName && displayName !== user.username) {
      return `${displayName} | @${user.username}`;
    }

    return `@${user.username}`;
  }, [user]);

  return (
    <div className="chat-root">
      <header className="chat-topbar">
        <div className="chat-topbar__brand">
          <div className="chat-topbar__logo">C</div>
          <div>
            <div className="chat-topbar__title">ChatApp</div>
            <div className="chat-topbar__subtitle">{currentUserSubtitle}</div>
          </div>
        </div>

        <div className="chat-topbar__actions">
          <button className="btn btn-outline btn-sm" onClick={() => setShowSearchModal(true)}>
            Tìm bạn
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowCreateModal(true)}>
            + Tạo nhóm
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="chat-body">
        <aside className="chat-sidebar">
          <ConversationList
            conversations={conversations}
            currentUserId={user?.id}
            selectedId={selectedConversation}
            onSelectConversation={handleSelectConversation}
            loading={conversationsLoading}
          />
        </aside>

        <main className="chat-main">
          <div className="chat-header">
            {selectedConversationData ? (
              <>
                <div className="chat-header__avatar-wrap">
                  <div className="chat-header__avatar">
                    {conversationAvatarUrl ? (
                      <img
                        src={conversationAvatarUrl}
                        alt={conversationLabel}
                        onError={privateConversation ? handleAvatarError : undefined}
                      />
                    ) : (
                      conversationAvatarFallback
                    )}
                  </div>
                  {privateConversation && (
                    <span
                      className={`presence-dot presence-dot--header ${online ? 'online' : 'offline'}`}
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="chat-header__info">
                  <div className="chat-header__name">{conversationLabel}</div>
                  <div
                    className={`chat-header__status${privateConversation ? '' : ' chat-header__status--group'}`}
                  >
                    {privateConversation && (
                      <span className={`presence-dot ${online ? 'online' : 'offline'}`} aria-hidden="true" />
                    )}
                    <span>{conversationStatus}</span>
                  </div>
                  <div className="chat-header__meta">{conversationMeta}</div>
                </div>
              </>
            ) : (
              <div className="chat-header__name" style={{ color: 'var(--text-tertiary)' }}>
                Chọn một cuộc trò chuyện
              </div>
            )}
          </div>

          <div className="messages-area">
            <MessageList
              messages={messages}
              currentUserId={user?.id}
              loading={messagesLoading}
            />
          </div>

          <MessageInput onSend={handleSendMessage} disabled={!selectedConversation} />
        </main>
      </div>

      <CreateConversationModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={async (payload) => {
          await handleCreateConversation(payload);
          setShowCreateModal(false);
        }}
        currentUserId={user?.id}
      />

      <SearchFriendsModal
        show={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        currentUserId={user?.id}
        onStartConversation={async (targetUser) => {
          await handleCreateConversation({
            type: 'PRIVATE',
            memberIds: [targetUser.id],
          });
          setShowSearchModal(false);
        }}
      />
    </div>
  );
}
