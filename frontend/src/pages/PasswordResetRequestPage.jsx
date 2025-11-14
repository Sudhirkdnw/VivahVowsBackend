import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../components/FormField';
import apiClient from '../api/client';

function PasswordResetRequestPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await apiClient.post('/api/auth/password-reset/', { email });
      setStatus({ ok: true, message: 'Check your inbox for the reset token.' });
    } catch (error) {
      setStatus({ ok: false, message: error.response?.data?.email || 'Email not found.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div>
          <h1>Reset password</h1>
          <p className="helper-text">Enter your account email to receive a reset token.</p>
        </div>
        {status ? (
          <div className={status.ok ? 'success-banner' : 'error-banner'}>{status.message}</div>
        ) : null}
        <form className="card" onSubmit={handleSubmit}>
          <FormField
            label="Email"
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset token'}
          </button>
        </form>
        <div className="helper-text">
          Remembered it? <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export default PasswordResetRequestPage;
