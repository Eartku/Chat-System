import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../store/authSlice.js';
import { getResolvedAvatarUrl, handleAvatarError } from '../utils/avatar.js';
import { validateImageFile } from '../utils/imageUpload.js';
import { uploadAvatar } from '../api/userApi.js';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarMode, setAvatarMode] = useState('url'); // 'url' | 'file'
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/chat');
  }, [isAuthenticated, navigate]);

  const previewName = useMemo(
    () => displayName.trim() || username.trim() || 'Tên hiển thị của bạn',
    [displayName, username]
  );

  const previewUsername = useMemo(
    () => (username.trim() ? `@${username.trim()}` : '@username'),
    [username]
  );

  const previewAvatar = useMemo(() => getResolvedAvatarUrl(avatarUrl), [avatarUrl]);

  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setFileError(validationError);
      return;
    }
    setFileError('');
    setUploading(true);
    try {
      const { url } = await uploadAvatar(file);
      setAvatarUrl(url);
    } catch {
      setFileError('Tải ảnh lên thất bại, thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(register({ displayName, username, email, password, avatarUrl }));
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-xl-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="card-title mb-2">Đăng ký</h2>
              <p className="text-muted mb-4">
                Tạo tài khoản với tên hiển thị riêng và avatar mặc định hoặc ảnh bạn muốn dùng.
              </p>

              {/* Avatar preview */}
              <div className="register-avatar-shell mb-4">
                <div
                  className="register-avatar-preview"
                  style={{ cursor: 'pointer', position: 'relative' }}
                  onClick={() => fileInputRef.current?.click()}
                  title="Nhấn để chọn ảnh"
                >
                  <img src={previewAvatar} alt={previewName} onError={handleAvatarError} />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 150ms',
                      borderRadius: 'inherit',
                      color: '#fff',
                      fontSize: 20,
                    }}
                    className="avatar-hover-overlay"
                  >
                    📷
                  </div>
                </div>
                <div className="register-avatar-copy">
                  <div className="register-avatar-title">{previewName}</div>
                  <div className="register-avatar-subtitle">{previewUsername}</div>
                  <div className="register-avatar-hint">
                    Nhấn vào ảnh để tải lên, hoặc nhập URL bên dưới.
                  </div>
                </div>
              </div>

              <style>{`
                .register-avatar-preview:hover .avatar-hover-overlay { opacity: 1 !important; }
              `}</style>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Tên hiển thị</label>
                  <input
                    type="text"
                    className="form-control"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Dùng để đăng nhập"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Avatar input: tabs for URL vs file */}
                <div className="mb-3">
                  <label className="form-label">Avatar</label>

                  <div className="type-toggle mb-2">
                    <button
                      type="button"
                      className={`type-option${avatarMode === 'url' ? ' selected' : ''}`}
                      onClick={() => setAvatarMode('url')}
                    >
                      🔗 Nhập URL
                    </button>
                    <button
                      type="button"
                      className={`type-option${avatarMode === 'file' ? ' selected' : ''}`}
                      onClick={() => { setAvatarMode('file'); fileInputRef.current?.click(); }}
                    >
                      📁 Tải file lên
                    </button>
                  </div>

                  {avatarMode === 'url' ? (
                    <>
                      <input
                        type="url"
                        className="form-control"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                      />
                      <div className="form-text register-helper-text">
                        Có thể bỏ qua, hệ thống sẽ dùng avatar mặc định.
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                      style={{
                        padding: '10px 13px',
                        border: '1.5px dashed var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-2)',
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        opacity: uploading ? 0.6 : 1,
                      }}
                      onClick={() => !uploading && fileInputRef.current?.click()}
                    >
                      {uploading
                        ? 'Đang tải lên...'
                        : avatarUrl
                        ? 'Đã tải ảnh lên — nhấn để đổi'
                        : 'Nhấn để chọn ảnh từ máy tính'}
                    </div>
                      {fileError && (
                        <div className="alert alert-danger mt-2 mb-0" style={{ padding: '8px 12px', fontSize: 13 }}>
                          {fileError}
                        </div>
                      )}
                      <div className="form-text register-helper-text">
                        JPG, PNG, GIF, WEBP — tối đa 2MB.
                      </div>
                    </>
                  )}

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Đang tạo...' : 'Đăng ký'}
                </button>
              </form>

              <div className="mt-3 text-center">
                <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}