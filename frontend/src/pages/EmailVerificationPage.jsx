import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../components/FormField';
import apiClient from '../api/client';

function EmailVerificationPage() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await apiClient.post('/api/auth/verify-email/', { token });
      setStatus({ ok: true, message: 'Email verified successfully. You may now sign in.' });
    } catch (error) {
      setStatus({ ok: false, message: error.response?.data?.token || 'Invalid or expired token.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div>
          <h1>Verify email</h1>
          <p className="helper-text">
            Paste the verification token you received via email to activate your profile.
          </p>
        </div>
        {status ? (
          <div className={status.ok ? 'success-banner' : 'error-banner'}>{status.message}</div>
        ) : null}
        <form className="card" onSubmit={handleSubmit}>
          <FormField
            label="Verification token"
            id="token"
            name="token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            required
          />
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Verifying…' : 'Verify email'}
          </button>
        </form>
        <div className="helper-text">
          Ready to sign in? <Link to="/login">Return to login</Link>
        </div>
      </div>
    </div>
  );
}

export default EmailVerificationPage;
