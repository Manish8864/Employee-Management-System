import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css';  // Ensure styles are imported

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(identifier, password);
      if (user.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-professional-container fade-in">
      <div className="login-glass-card">
        <div className="login-header">
          <div className="logo">👨‍💼 EMS</div>
          <h2>Portal Login</h2>
          <p className="subtitle">Employee Management System</p>
        </div>
        {error && (
          <div className="error-alert-modern shake">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="login-form-modern">
          <div className="form-group-modern">
            <label className="label-modern">Email or Employee ID</label>
            <input
              type="text"
              className="input-modern focus-glow"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter email or EMP ID"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group-modern">
            <label className="label-modern">Password</label>
            <input
              type="password"
              className="input-modern focus-glow"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-modern-primary btn-glow hover-lift" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          Don't have an account? <Link to="/register" className="link-modern">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
