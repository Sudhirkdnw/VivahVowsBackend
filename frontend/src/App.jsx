import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import NotificationToaster from './components/NotificationToaster.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ChatPage from './pages/ChatPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MatchSuggestionsPage from './pages/MatchSuggestionsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import { selectAuthTokens } from './redux/authSlice.js';
import { pushNotification } from './redux/notificationSlice.js';

const App = () => {
  const dispatch = useDispatch();
  const tokens = useSelector(selectAuthTokens);
  const [toast, setToast] = useState([]);

  useEffect(() => {
    if (!tokens.access) {
      return undefined;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(
      `${protocol}://${window.location.host}/ws/notifications/?token=${tokens.access}`
    );
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const notification = {
        id: Date.now(),
        event: data.event,
        payload: data.payload,
        is_read: false
      };
      dispatch(pushNotification(notification));
      setToast((prev) => [notification, ...prev].slice(0, 3));
      setTimeout(() => {
        setToast((current) => current.filter((item) => item.id !== notification.id));
      }, 5000);
    };
    return () => {
      socket.close();
    };
  }, [tokens.access, dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <MatchSuggestionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <NotificationToaster notifications={toast} />
    </>
  );
};

export default App;
