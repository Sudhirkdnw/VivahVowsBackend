import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';

import AuthLayout from '../../components/layout/AuthLayout.jsx';
import { confirmPasswordResetToken, requestPasswordResetToken } from '../../redux/authSlice.js';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const status = useSelector((state) => state.auth.status);
  const error = useSelector((state) => state.auth.error);
  const [email, setEmail] = useState('');
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [success, setSuccess] = useState(false);

  const handleRequest = async (event) => {
    event.preventDefault();
    const action = await dispatch(requestPasswordResetToken(email));
    if (requestPasswordResetToken.fulfilled.match(action)) {
      setSuccess(true);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    if (passwords.password !== passwords.confirm) {
      alert('Passwords do not match');
      return;
    }
    const action = await dispatch(
      confirmPasswordResetToken({ token, password: passwords.password })
    );
    if (confirmPasswordResetToken.fulfilled.match(action)) {
      setSuccess(true);
    }
  };

  return (
    <AuthLayout
      title={token ? 'Choose a new password' : 'Reset your password'}
      subtitle={
        token
          ? 'Create a fresh password to secure your VivahVows account'
          : 'We’ll send password reset instructions to your inbox'
      }
    >
      {success && (
        <div className="surface-card" style={{ border: '1px solid rgba(134,239,172,0.5)', background: 'rgba(34,197,94,0.12)' }}>
          {token ? 'Password updated! You can now sign in.' : 'Email sent! Check your inbox for instructions.'}
        </div>
      )}
      {error && (
        <div className="surface-card" style={{ border: '1px solid rgba(248,113,113,0.5)', background: 'rgba(248,113,113,0.1)' }}>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      {!token && (
        <form className="form-grid" style={{ gap: '16px' }} onSubmit={handleRequest}>
          <label className="field-group" htmlFor="reset-email">
            <span>Email</span>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button type="submit" className="button" disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending…' : 'Send reset link'}
          </button>
          <div style={{ textAlign: 'center' }}>
            Remembered your password? <Link to="/login">Back to login</Link>
          </div>
        </form>
      )}
      {token && (
        <form className="form-grid" style={{ gap: '16px' }} onSubmit={handleReset}>
          <label className="field-group" htmlFor="new-password">
            <span>New password</span>
            <input
              id="new-password"
              type="password"
              required
              value={passwords.password}
              onChange={(event) => setPasswords((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>
          <label className="field-group" htmlFor="confirm-password">
            <span>Confirm password</span>
            <input
              id="confirm-password"
              type="password"
              required
              value={passwords.confirm}
              onChange={(event) => setPasswords((prev) => ({ ...prev, confirm: event.target.value }))}
            />
          </label>
          <button type="submit" className="button" disabled={status === 'loading'}>
            {status === 'loading' ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
