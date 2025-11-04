import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { logout, selectIsAuthenticated } from '../redux/authSlice.js';
import { selectUnreadCount } from '../redux/notificationSlice.js';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const unreadCount = useSelector(selectUnreadCount);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="navbar">
      <nav className="navbar__content container">
        <Link to="/" className="navbar__brand">
          VivahVows
        </Link>
        <div className="navbar__links">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/matches">Matches</Link>
              <Link to="/chat">Chat</Link>
              <Link to="/notifications">
                Notifications{unreadCount ? ` (${unreadCount})` : ''}
              </Link>
              <button type="button" onClick={handleLogout} className="navbar__logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
