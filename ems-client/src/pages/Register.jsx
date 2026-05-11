import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.post('/auth/register', { ...formData, role: 'employee' });
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-professional-container fade-in">
      <div className="login-glass-card">
        <div className="login-header">
          <div className="logo">🧑‍💼‍🚀 EMS</div>
          <h2>Employee Registration</h2>
          <p className="subtitle">Create your employee account</p>
        </div>

        {error && (
          <div className="error-alert-modern shake">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {message && (
          <div className="alert-modern alert-success">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form-modern">
          <div className="form-group-modern">
            <label className="label-modern">Email</label>
            <input
              type="email"
              name="email"
              className="input-modern focus-glow"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="manager@ems.com"
              disabled={loading}
            />
          </div>

          <div className="form-group-modern">
            <label className="label-modern">Password</label>
            <input
              type="password"
              name="password"
              className="input-modern focus-glow"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="••••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-modern-primary btn-glow hover-lift"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Registering...
              </>
            ) : (
              'Register as Employee'
            )}
          </button>
        </form>

        <div className="login-footer">
          Already have an account?{' '}
          <Link to="/login" className="link-modern">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;