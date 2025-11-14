import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import AppShell from './components/layout/AppShell.jsx';
import ToastStack from './components/common/ToastStack.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import MatchesPage from './pages/MatchesPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { selectAuthTokens, selectIsAuthenticated } from './redux/authSlice.js';
import { pushNotification } from './redux/notificationSlice.js';

const AuthenticatedLayout = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const tokens = useSelector(selectAuthTokens);
  const [toastStack, setToastStack] = useState([]);

  useEffect(() => {
    if (!tokens.access) {
      return undefined;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(
      `${protocol}://${window.location.host}/ws/notifications/?token=${tokens.access}`
    );
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const notification = {
          id: Date.now(),
          event: data.event,
          payload: data.payload,
          detail: data.payload?.message ?? 'Activity update',
          is_read: false
        };
        dispatch(pushNotification(notification));
        setToastStack((current) => [notification, ...current].slice(0, 4));
        setTimeout(() => {
          setToastStack((current) => current.filter((item) => item.id !== notification.id));
        }, 5000);
      } catch (error) {
        console.error('Unable to parse notification payload', error);
      }
    };
    socket.onerror = () => {
      socket.close();
      setToastStack((current) => [
        { id: Date.now(), event: 'connection_error', detail: 'Notification channel disconnected.' },
        ...current
      ].slice(0, 4));
    };
    return () => socket.close();
  }, [dispatch, tokens.access]);

  return (
    <>
      <Routes>
        <Route element={<AuthenticatedLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastStack notifications={toastStack} />
    </>
  );
};

export default App;
