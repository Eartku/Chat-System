import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createConversation } from '../store/conversationSlice.js';
import { searchUsers } from '../api/userApi.js';

export default function SearchFriendsModal({ show, onClose, currentUserId }) {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatLoading, setChatLoading] = useState(null);

  const handleSearch = async (value) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await searchUsers(value.trim());
      const filtered = data.filter((user) => user.userId !== currentUserId);
      setResults(filtered);
    } catch (err) {
      console.error('[SearchFriendsModal] search error', err);
      setError('Không thể tìm kiếm người dùng');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (user) => {
    setChatLoading(user.userId);
    try {
      await dispatch(createConversation({
        type: 'PRIVATE',
        memberIds: [user.userId]
      }));
      setQuery('');
      setResults([]);
      onClose();
    } catch (err) {
      console.error('[SearchFriendsModal] create chat error', err);
      setError('Không thể tạo cuộc trò chuyện');
    } finally {
      setChatLoading(null);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ minWidth: '400px' }}>
        <div className="modal-header">
          <h2>Tìm kiếm bạn bè</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Tìm theo tên hoặc email..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />

          {error && (
            <div style={{ marginTop: '16px', padding: '10px', background: '#fee', color: '#c33', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <div className="spinner" style={{ display: 'inline-block' }} />
              <span style={{ marginLeft: '10px' }}>Đang tìm kiếm...</span>
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              Không tìm thấy người dùng
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="search-results" style={{ marginTop: '16px' }}>
              {results.map((user) => (
                <div key={user.userId} className="search-result-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div className="search-result-avatar">{user.username.charAt(0).toUpperCase()}</div>
                    <div className="search-result-info">
                      <div className="search-result-name">{user.username}</div>
                      <div className="search-result-email">{user.email}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleStartChat(user)}
                    disabled={chatLoading === user.userId}
                    style={{ marginLeft: '10px' }}
                  >
                    {chatLoading === user.userId ? 'Đang tạo...' : 'Chat'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
