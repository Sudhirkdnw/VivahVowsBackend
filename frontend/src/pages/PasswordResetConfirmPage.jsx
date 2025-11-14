import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import apiClient from '../api/client';

function PasswordResetConfirmPage() {
  const location = useLocation();
  const prefilledToken = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('token') || '';
  }, [location.search]);

  const [form, setForm] = useState({ token: prefilledToken, password: '', confirmPassword: '' });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setForm((prev) => ({ ...prev, token: prefilledToken }));
  }, [prefilledToken]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setStatus({ ok: false, message: 'Passwords do not match.' });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      await apiClient.post('/api/auth/password-reset/confirm/', {
        token: form.token,
        password: form.password,
      });
      setStatus({ ok: true, message: 'Password updated. Redirecting to login…' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setStatus({ ok: false, message: error.response?.data?.token || 'Invalid token.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div>
          <h1>Set new password</h1>
          <p className="helper-text">Paste your token and choose a strong password.</p>
        </div>
        {status ? (
          <div className={status.ok ? 'success-banner' : 'error-banner'}>{status.message}</div>
        ) : null}
        <form className="card" onSubmit={handleSubmit}>
          <FormField
            label="Reset token"
            id="token"
            name="token"
            value={form.token}
            onChange={handleChange}
            required
          />
          <FormField
            label="New password"
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <FormField
            label="Confirm new password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
        <div className="helper-text">
          Return to <Link to="/login">sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default PasswordResetConfirmPage;
