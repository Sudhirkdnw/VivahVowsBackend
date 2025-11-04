import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { register } from '../redux/authSlice.js';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [message, setMessage] = useState(null);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) {
      setMessage('Registration successful! Check your email for verification instructions.');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setMessage(result.payload?.detail ?? 'Unable to register');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '520px' }}>
      <div className="card">
        <h2>Create your account</h2>
        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" value={form.username} onChange={handleChange} required />
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <label htmlFor="first_name">First name</label>
          <input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} />
          <label htmlFor="last_name">Last name</label>
          <input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} />
          <button type="submit" className="button-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Register
          </button>
        </form>
        {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
