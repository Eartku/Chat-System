import { useState, useEffect } from 'react';

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function CreateConversationModal({ show, onClose, onCreate, currentUserId }) {
  const [type, setType] = useState('PRIVATE');
  const [name, setName] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [memberIds, setMemberIds] = useState('');

  useEffect(() => {
    if (!show) {
      setType('PRIVATE');
      setName('');
      setImgUrl('');
      setMemberIds('');
    }
  }, [show]);

  if (!show) return null;

  const parseMemberIds = () =>
    memberIds
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isInteger(id) && id > 0 && id !== currentUserId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { type, memberIds: parseMemberIds() };
    if (type === 'GROUP') {
      payload.name = name.trim();
      payload.imgUrl = imgUrl.trim() || undefined;
    }
    onCreate(payload);
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <span className="modal-title">Tạo cuộc trò chuyện mới</span>
          <button className="close-btn" onClick={onClose}><CloseIcon /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Type toggle */}
            <div className="form-group">
              <label className="form-label">Loại cuộc trò chuyện</label>
              <div className="type-toggle">
                <button
                  type="button"
                  className={`type-option${type === 'PRIVATE' ? ' selected' : ''}`}
                  onClick={() => setType('PRIVATE')}
                >
                  👤 Riêng tư
                </button>
                <button
                  type="button"
                  className={`type-option${type === 'GROUP' ? ' selected' : ''}`}
                  onClick={() => setType('GROUP')}
                >
                  👥 Nhóm
                </button>
              </div>
            </div>

            {type === 'GROUP' && (
              <>
                <div className="form-group">
                  <label className="form-label">Tên nhóm</label>
                  <input
                    className="form-control"
                    placeholder="Nhập tên nhóm..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Ảnh nhóm (URL)</label>
                  <input
                    className="form-control"
                    placeholder="https://..."
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Member IDs</label>
              <input
                className="form-control"
                placeholder="1, 2, 3"
                value={memberIds}
                onChange={(e) => setMemberIds(e.target.value)}
                required
              />
              <p className="form-hint">Nhập ID cách nhau bằng dấu phẩy. Không cần nhập ID của bạn.</p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">Tạo cuộc trò chuyện</button>
          </div>
        </form>
      </div>
    </div>
  );
}