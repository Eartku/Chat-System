import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import { fetchMe, logout } from './store/authSlice.js';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && (!user || !user.id)) {
      dispatch(fetchMe()).unwrap().catch(() => dispatch(logout()));
    }
  }, [dispatch, token, user]);

  useEffect(() => {
    if (!token && !['/login', '/register'].includes(location.pathname)) {
      navigate('/login');
    }
  }, [navigate, token, location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route path="/*" element={<Navigate to={token ? '/chat' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
