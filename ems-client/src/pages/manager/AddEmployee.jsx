import React, { useState } from 'react';
import api from '../../api/axios';

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    phone: '',
    address: ''
  });
  const [generatedId, setGeneratedId] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generatePreviewId = () => {
    const previewName = formData.name || 'EMP';
    const previewDate = Date.now();
    const nameHash = previewName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const nameCode = (nameHash % 99 + 1).toString().padStart(2, '0');
    const day = new Date(previewDate).getDate().toString().padStart(2, '0');
    const deptCode = previewName.substring(0, 2).toUpperCase();
    return `EMP${nameCode}${day}${deptCode}`;
  };

  const handleChange = (e) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newFormData);
    if (e.target.name === 'name') {
      setGeneratedId(generatePreviewId());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);

      setMessage('Employee registered successfully! ID: ' + generatedId);

      setFormData({
        name: '',
        email: '',
        password: '',
        department: '',
        phone: '',
        address: ''
      });
      setGeneratedId('');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container-modern">
      <div className="page-header-modern">
        <div className="header-left">
          <h1 className="dashboard-title">Add Employee</h1>
          <p className="header-subtitle">Register a new employee to the system</p>
        </div>
      </div>

      {message && (
        <div className="alert alert-success-modern">
          <span className="alert-icon">OK</span>
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-error-modern">
          <span className="alert-icon">X</span>
          {error}
        </div>
      )}

      <div className="card card-modern" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header-modern">
          <h3><span>+</span> Employee Registration Form</h3>
        </div>
        <div className="card-body-modern">
          <form onSubmit={handleSubmit}>
            <div className="form-group-modern">
              <label className="label-modern">Name <span className="required">*</span></label>
              <input 
                type="text" 
                name="name" 
                className="input-modern" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Enter full name"
                required 
              />
            </div>

            <div className="form-group-modern">
              <label className="label-modern">Generated Employee ID</label>
              <input 
                type="text" 
                className="input-modern id-preview" 
                value={generatedId || 'Enter name to preview'} 
                readOnly 
              />
              <small className="form-hint">Auto-generated based on name. Final ID uses join date.</small>
            </div>

            <div className="form-row">
              <div className="form-group-modern">
                <label className="label-modern">Email <span className="required">*</span></label>
                <input 
                  type="email" 
                  name="email" 
                  className="input-modern" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="Enter email address"
                  required 
                />
              </div>

              <div className="form-group-modern">
                <label className="label-modern">Password <span className="required">*</span></label>
                <input 
                  type="password" 
                  name="password" 
                  className="input-modern" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Min 6 characters"
                  required 
                  minLength="6" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-modern">
                <label className="label-modern">Department</label>
                <input 
                  type="text" 
                  name="department" 
                  className="input-modern" 
                  value={formData.department} 
                  onChange={handleChange}
                  placeholder="e.g. Engineering, Design"
                />
              </div>

              <div className="form-group-modern">
                <label className="label-modern">Phone</label>
                <input 
                  type="text" 
                  name="phone" 
                  className="input-modern" 
                  value={formData.phone} 
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label className="label-modern">Address</label>
              <textarea 
                name="address" 
                className="input-modern textarea-modern" 
                rows="3" 
                value={formData.address} 
                onChange={handleChange}
                placeholder="Enter full address"
              />
            </div>

            <button type="submit" className="btn btn-primary-modern btn-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Registering...
                </>
              ) : (
                <>
                  <span>+</span>
                  Register Employee
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
