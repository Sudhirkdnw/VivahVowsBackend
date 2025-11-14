import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const { register, setError, error } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    try {
      await register(form);
      setSuccess(true);
      setError(null);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data || { detail: 'Unable to register with provided details.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div>
          <h1>Create your profile</h1>
          <p className="helper-text">Discover meaningful matches with VivahVows.</p>
        </div>
        {error ? <div className="error-banner">{error.detail || 'Please review your details.'}</div> : null}
        {success ? (
          <div className="success-banner">
            Registration successful! Please verify your email before signing in.
          </div>
        ) : null}
        <form className="card" onSubmit={handleSubmit}>
          <FormField
            label="First name"
            id="first_name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
          <FormField
            label="Last name"
            id="last_name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
          <FormField
            label="Username"
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <FormField
            label="Email"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <FormField
            label="Password"
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <div className="helper-text">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
