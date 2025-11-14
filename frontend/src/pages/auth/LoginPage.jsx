import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';

import AuthLayout from '../../components/layout/AuthLayout.jsx';
import { login, selectIsAuthenticated } from '../../redux/authSlice.js';

const LoginPage = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const status = useSelector((state) => state.auth.status);
  const error = useSelector((state) => state.auth.error);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(login(credentials));
  };

  return (
    <AuthLayout
      title="Sign in to VivahVows OS"
      subtitle="Access your personalised matchmaking workspace"
    >
      <form className="form-grid" style={{ gap: '16px' }} onSubmit={handleSubmit}>
        {error && (
          <div className="surface-card" style={{ border: '1px solid rgba(248,113,113,0.5)', background: 'rgba(248,113,113,0.1)' }}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
        <label className="field-group" htmlFor="email">
          <span>Email</span>
          <input
            id="email"
            type="email"
            required
            value={credentials.email}
            onChange={(event) => setCredentials((prev) => ({ ...prev, email: event.target.value }))}
          />
        </label>
        <label className="field-group" htmlFor="password">
          <span>Password</span>
          <input
            id="password"
            type="password"
            required
            value={credentials.password}
            onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
          />
        </label>
        <button type="submit" className="button" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in…' : 'Sign in'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
          <Link to="/register">Create an account</Link>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
