import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import AuthLayout from '../../components/layout/AuthLayout.jsx';
import { register } from '../../redux/authSlice.js';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.auth.status);
  const error = useSelector((state) => state.auth.error);
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formState.password !== formState.confirmPassword) {
      return alert('Passwords do not match');
    }
    const action = await dispatch(register({
      email: formState.email,
      password: formState.password,
      name: formState.name
    }));
    if (register.fulfilled.match(action)) {
      setSuccess(true);
    }
  };

  return (
    <AuthLayout title="Create your workspace" subtitle="Join the modern VivahVows experience">
      <form className="form-grid" style={{ gap: '16px' }} onSubmit={handleSubmit}>
        {success && (
          <div className="surface-card" style={{ border: '1px solid rgba(134,239,172,0.5)', background: 'rgba(34,197,94,0.12)' }}>
            Registration complete! Check your inbox to verify your email.
          </div>
        )}
        {error && (
          <div className="surface-card" style={{ border: '1px solid rgba(248,113,113,0.5)', background: 'rgba(248,113,113,0.1)' }}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
        <label className="field-group" htmlFor="name">
          <span>Full name</span>
          <input
            id="name"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </label>
        <label className="field-group" htmlFor="email">
          <span>Email</span>
          <input
            id="email"
            type="email"
            required
            value={formState.email}
            onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
          />
        </label>
        <label className="field-group" htmlFor="password">
          <span>Password</span>
          <input
            id="password"
            type="password"
            required
            value={formState.password}
            onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
          />
        </label>
        <label className="field-group" htmlFor="confirmPassword">
          <span>Confirm password</span>
          <input
            id="confirmPassword"
            type="password"
            required
            value={formState.confirmPassword}
            onChange={(event) => setFormState((prev) => ({ ...prev, confirmPassword: event.target.value }))}
          />
        </label>
        <button type="submit" className="button" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating account…' : 'Create account'}
        </button>
        <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
          Already onboard? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
