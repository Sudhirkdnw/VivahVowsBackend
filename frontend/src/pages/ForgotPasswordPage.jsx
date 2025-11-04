import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import {
  confirmPasswordResetToken,
  requestPasswordResetToken
} from '../redux/authSlice.js';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handleRequest = async (event) => {
    event.preventDefault();
    const result = await dispatch(requestPasswordResetToken(email));
    if (requestPasswordResetToken.fulfilled.match(result)) {
      setMessage('Password reset email sent. Check your inbox for the token.');
    } else {
      setMessage(result.payload?.detail ?? 'Unable to send email');
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    const result = await dispatch(confirmPasswordResetToken({ token, password }));
    if (confirmPasswordResetToken.fulfilled.match(result)) {
      setMessage('Password updated successfully. You can login now.');
    } else {
      setMessage(result.payload?.detail ?? 'Unable to reset password');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '520px' }}>
      <div className="card">
        <h2>Forgot Password</h2>
        <form onSubmit={handleRequest} className="form">
          <label htmlFor="email">Registered email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <button type="submit" className="button-primary">
            Send reset email
          </button>
        </form>
        <hr style={{ margin: '1.5rem 0' }} />
        <form onSubmit={handleReset} className="form">
          <label htmlFor="token">Reset token</label>
          <input id="token" value={token} onChange={(event) => setToken(event.target.value)} />
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="submit" className="button-secondary">
            Reset password
          </button>
        </form>
        {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
