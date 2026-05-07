import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../store/authSlice.js';
import { getResolvedAvatarUrl, handleAvatarError } from '../utils/avatar.js';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    await dispatch(
      register({
        displayName,
        username,
        email,
        password,
        avatarUrl,
      })
    );
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

              <div className="register-avatar-shell mb-4">
                <div className="register-avatar-preview">
                  <img src={previewAvatar} alt={previewName} onError={handleAvatarError} />
                </div>
                <div className="register-avatar-copy">
                  <div className="register-avatar-title">{previewName}</div>
                  <div className="register-avatar-subtitle">{previewUsername}</div>
                  <div className="register-avatar-hint">
                    Để trống avatar nếu bạn muốn dùng ảnh mặc định.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Tên hiển thị</label>
                  <input
                    type="text"
                    className="form-control"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
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
                    onChange={(event) => setUsername(event.target.value)}
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
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Avatar URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <div className="form-text register-helper-text">
                    Có thể bỏ qua trường này, hệ thống sẽ tự dùng avatar mặc định.
                  </div>
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
