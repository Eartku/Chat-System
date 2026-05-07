import { useEffect, useMemo, useState } from 'react';
import { searchUsers } from '../api/userApi.js';
import { getErrorMessage } from '../utils/apiError.js';
import { handleAvatarError, getResolvedAvatarUrl } from '../utils/avatar.js';
import { getUserDisplayName } from '../utils/conversationDisplay.js';

export default function CreateConversationModal({ show, onClose, onCreate, currentUserId }) {
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!show) {
      setName('');
      setQuery('');
      setResults([]);
      setSelectedMembers([]);
      setSearchLoading(false);
      setError(null);
      setSubmitting(false);
    }
  }, [show]);

  const selectedMemberIds = useMemo(
    () => new Set(selectedMembers.map((member) => Number(member.id))),
    [selectedMembers]
  );

  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setResults([]);
      setSearchLoading(false);
      return undefined;
    }

    let active = true;
    const timeoutId = window.setTimeout(async () => {
      setSearchLoading(true);
      setError(null);
      try {
        const data = await searchUsers(normalizedQuery);
        if (!active) return;
        const filtered = data.filter(
          (user) =>
            Number(user.id) !== Number(currentUserId) && !selectedMemberIds.has(Number(user.id))
        );
        setResults(filtered);
      } catch (err) {
        if (!active) return;
        console.error('[CreateConversationModal] search error', err);
        setResults([]);
        setError('Không thể tìm kiếm người dùng để thêm vào nhóm.');
      } finally {
        if (active) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [currentUserId, query, selectedMemberIds, show]);

  if (!show) return null;

  const handleAddMember = (user) => {
    setError(null);
    setSelectedMembers((current) => {
      if (current.some((member) => Number(member.id) === Number(user.id))) {
        return current;
      }
      return [...current, user];
    });
    setResults((current) => current.filter((member) => Number(member.id) !== Number(user.id)));
  };

  const handleRemoveMember = (memberId) => {
    setSelectedMembers((current) => current.filter((member) => Number(member.id) !== Number(memberId)));
  };

  const handleCreate = async () => {
    setError(null);
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Vui lòng nhập tên nhóm.');
      return;
    }

    if (selectedMembers.length < 1) {
      setError('Vui lòng chọn ít nhất một thành viên cho nhóm chat.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        type: 'GROUP',
        name: trimmedName,
        memberIds: selectedMembers.map((member) => member.id),
      });
    } catch (err) {
      console.error('[CreateConversationModal] create error', err);
      setError(getErrorMessage(err, 'Không thể tạo nhóm chat. Vui lòng thử lại.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card group-modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Tạo nhóm chat</h2>
            <p className="modal-subtitle">
              Đặt tên nhóm và chọn thành viên trực tiếp, không cần nhập ID thủ công.
            </p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>

        <div className="modal-body group-builder">
          <div className="group-builder__section">
            <label htmlFor="conversation-name" className="form-label">
              Tên nhóm
            </label>
            <input
              id="conversation-name"
              type="text"
              className="search-input"
              placeholder="Ví dụ: Team dự án, Lớp học tối nay..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              autoFocus
            />
          </div>

          <div className="group-builder__section">
            <div className="group-builder__section-head">
              <label htmlFor="member-search" className="form-label">
                Thêm thành viên
              </label>
              <span className="group-builder__summary">Bạn + {selectedMembers.length} thành viên</span>
            </div>
            <input
              id="member-search"
              type="text"
              className="search-input"
              placeholder="Tìm theo username hoặc email để thêm vào nhóm..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setError(null);
              }}
            />
            <div className="search-panel__hint">Chọn ít nhất một người khác để tạo nhóm mới.</div>
          </div>

          {selectedMembers.length > 0 && (
            <div className="group-builder__section">
              <div className="group-builder__section-head">
                <div className="form-label">Thành viên đã chọn</div>
              </div>
              <div className="selected-members">
                {selectedMembers.map((member) => (
                  <div key={member.id} className="selected-member-chip">
                    <div className="selected-member-chip__avatar">
                      <img
                        src={getResolvedAvatarUrl(member)}
                        alt={getUserDisplayName(member)}
                        onError={handleAvatarError}
                      />
                    </div>
                    <div className="selected-member-chip__info">
                      <div className="selected-member-chip__name">{getUserDisplayName(member)}</div>
                      <div className="selected-member-chip__meta">@{member.username}</div>
                    </div>
                    <button
                      type="button"
                      className="selected-member-chip__remove"
                      onClick={() => handleRemoveMember(member.id)}
                      aria-label={`Xóa ${member.username} khỏi nhóm`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="alert alert-danger modal-alert">{error}</div>}

          <div className="group-builder__section">
            {searchLoading && (
              <div className="search-panel__state">
                <div className="spinner" style={{ display: 'inline-block' }} />
                <span>Đang tìm người dùng...</span>
              </div>
            )}

            {!searchLoading && !query.trim() && (
              <div className="search-panel__empty">
                Tìm người dùng để thêm vào nhóm. Bạn có thể thêm hoặc gỡ thành viên trước khi tạo.
              </div>
            )}

            {!searchLoading && query.trim() && results.length === 0 && (
              <div className="search-panel__empty">
                Không còn kết quả phù hợp để thêm vào nhóm.
              </div>
            )}

            {!searchLoading && results.length > 0 && (
              <div className="search-results search-results--spacious">
                {results.map((user) => (
                  <div key={user.id} className="search-result-item search-result-item--actionable">
                    <div className="search-result-item__main">
                      <div className="search-result-avatar">
                        <img
                          src={getResolvedAvatarUrl(user)}
                          alt={getUserDisplayName(user)}
                          onError={handleAvatarError}
                        />
                      </div>
                      <div className="search-result-info">
                        <div className="search-result-name">{getUserDisplayName(user)}</div>
                        {user.displayName && <div className="search-result-meta">@{user.username}</div>}
                        <div className="search-result-email">{user.email}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleAddMember(user)}
                    >
                      Thêm
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer modal-footer--flush">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo nhóm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
