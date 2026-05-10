import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';


const PersonalDetails = () => {
  const [details, setDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  // Enhanced password form states
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');
  const [validationWarning, setValidationWarning] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  const getDisplayId = (emp) => emp.empId || emp._id.slice(-6);

  useEffect(() => {
    fetchDetails();
  }, []);

  const calculateStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 25;
    return Math.min(score, 100);
  };

  const getStrengthLabel = (strength) => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  useEffect(() => {
    const newPass = passwordForm.newPassword;
    const confirm = passwordForm.confirmPassword;
    
    let warning = '';
    if (newPass && newPass.length < 8) {
      warning = 'Password must be at least 8 characters';
    } else if (newPass && confirm && newPass !== confirm) {
      warning = 'Passwords do not match';
    }
    setValidationWarning(warning);
    
    if (newPass) {
      const strength = calculateStrength(newPass);
      setPasswordStrength(strength);
      setStrengthLabel(getStrengthLabel(strength));
    }
  }, [passwordForm.newPassword, passwordForm.confirmPassword]);

  const fetchDetails = async () => {
    try {
      const { data } = await api.get('/employees/me');
      setDetails(data);
      setFormData({
        name: data.name || '',
        department: data.department || '',
        phone: data.phone || '',
        dob: data.dob || '',
        address: data.address || ''
      });
      setAvatarPreview(data.avatar || '');
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  const togglePasswordVisibility = (field) => {
    switch(field) {
      case 'current': setShowCurrentPass(!showCurrentPass); break;
      case 'new': setShowNewPass(!showNewPass); break;
      case 'confirm': setShowConfirmPass(!showConfirmPass); break;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', avatarFile);
      await api.put('/employees/' + details._id, formDataUpload, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      setMessage('Profile picture updated!');
      setAvatarFile(null);
      fetchDetails();
    } catch (error) {
      setMessage('Error uploading avatar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.dob) payload.dob = new Date(payload.dob).toISOString();
      await api.put('/employees/' + details._id, payload);
      setMessage('Details updated successfully!');
      setEditMode(false);
      fetchDetails();
    } catch (error) {
      setMessage('Error updating details');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8 || passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg('Fix validation errors');
      return;
    }
    setIsPasswordLoading(true);
    try {
      await api.put('/employees/me/change-password', passwordForm);
      setPasswordMsg('Password changed successfully! 🔒');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowChangePassword(false), 2000);
    } catch (error) {
      setPasswordMsg('Error changing password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent(details?.name || 'E')}&size=128&background=4F46E5&color=fff`;
    if (avatar.startsWith('/uploads')) return `http://localhost:5000${avatar}`;
    return avatar;
  };

  if (!details) return <div className="loading-modern">Loading...</div>;

  return (
    <div className="page-container-modern">
      <div className="page-header-modern">
        <div className="header-left">
          <h1 className="dashboard-title">Personal Details</h1>
          <p className="header-subtitle">Manage your profile information</p>
        </div>
        <div className="header-actions">
          {!editMode && !showChangePassword && (
            <>
              <button className="btn btn-primary-modern" onClick={() => setEditMode(true)}>
                ✏️ Edit Details
              </button>
              <button className="btn btn-secondary-modern" onClick={() => setShowChangePassword(true)}>
                🔐 Change Password
              </button>
            </>
          )}
        </div>
      </div>

      {message && (
        <div className={`alert alert-success-modern ${message.includes('Error') ? 'alert-error-modern' : ''}`}>
          {message}
        </div>
      )}

      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="card card-modern profile-card">
            <div className="profile-avatar-section">
              <img src={getAvatarUrl(details.avatar)} alt={details.name} className="profile-avatar-large" />
              <h3 className="profile-name">{details.name}</h3>
              <span className={`role-badge ${details.role}`}>{details.role?.toUpperCase()}</span>
              <p className="profile-id">ID: {getDisplayId(details)}</p>
            </div>
            <div className="profile-upload-section">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} />
              <button className="btn btn-primary-modern btn-sm btn-full" onClick={() => fileInputRef.current?.click()}>
                📸 Upload Photo
              </button>
              {avatarPreview && avatarPreview !== getAvatarUrl(details.avatar) && (
                <button className="btn btn-success-modern btn-sm btn-full" onClick={uploadAvatar}>
                  ✅ Save Photo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="profile-main">
          {editMode ? (
            <div className="card card-modern">
              <div className="card-header-modern">
                <h3>Edit Profile</h3>
              </div>
              <div className="card-body-modern">
                <form onSubmit={handleSubmit}>
                  <div className="form-group-modern">
                    <label className="label-modern">Full Name</label>
                    <input type="text" name="name" className="input-modern" value={formData.name || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group-modern">
                      <label className="label-modern">Department</label>
                      <input type="text" name="department" className="input-modern" value={formData.department || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group-modern">
                      <label className="label-modern">Phone</label>
                      <input type="tel" name="phone" className="input-modern" value={formData.phone || ''} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group-modern">
                    <label className="label-modern">Address</label>
                    <textarea name="address" className="input-modern textarea-modern" rows="3" value={formData.address || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group-modern">
                    <label className="label-modern">Date of Birth</label>
                    <input type="date" name="dob" className="input-modern" value={formData.dob ? formData.dob.split('T')[0] : ''} onChange={handleChange} />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="btn btn-success-modern">
                      💾 Save Changes
                    </button>
                    <button type="button" className="btn btn-secondary-modern" onClick={() => {
                      setEditMode(false);
                      fetchDetails();
                    }}>
                      ❌ Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : showChangePassword ? (
            <div className="card card-modern">
              <div className="card-header-modern">
                <h3>🔐 Change Password</h3>
              </div>
              <div className="card-body-modern">
                <form onSubmit={handleChangePassword}>
                  <div className="form-group-modern">
                    <label className="label-modern">Current Password</label>
                    <input 
                      type="password"
                      className="input-modern"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group-modern">
                    <label className="label-modern">New Password</label>
                    <input 
                      type="password"
                      className="input-modern"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required 
                    />
                    {passwordStrength > 0 && (
                      <div className="password-strength" style={{ marginTop: '5px' }}>
                        <div className="strength-bar" style={{ width: passwordStrength + '%', background: passwordStrength < 40 ? '#ef4444' : passwordStrength < 70 ? '#f59e0b' : '#10b981' }}></div>
                        <small>{strengthLabel}</small>
                      </div>
                    )}
                  </div>
                  <div className="form-group-modern">
                    <label className="label-modern">Confirm New Password</label>
                    <input 
                      type="password"
                      className="input-modern"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required 
                    />
                  </div>
                  {validationWarning && <div className="error">{validationWarning}</div>}
                  <div className="form-buttons">
                    <button type="submit" className="btn btn-success-modern" disabled={isPasswordLoading || !!validationWarning}>
                      {isPasswordLoading ? 'Changing...' : 'Change Password'}
                    </button>
                    <button type="button" className="btn btn-secondary-modern" onClick={() => setShowChangePassword(false)}>
                      Cancel
                    </button>
                  </div>
                  {passwordMsg && <div className={`alert ${passwordMsg.includes('success') ? 'success' : 'error'}`}>{passwordMsg}</div>}
                </form>
              </div>
            </div>
          ) : (

            <div className="card card-modern">
              <div className="card-header-modern">
                <h3>👤 Profile Information</h3>
              </div>

              <div className="card-body-modern">

                <div className="profile-grid">
                  <div className="profile-item">
                    <span className="profile-label">Employee ID:</span>

                    <span className="profile-value">EMP9630MA</span>
                  </div>


                  <div className="profile-item">
                    <span className="profile-label">Name:</span>
                    <span className="profile-value">Manish kumar</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Email:</span>
                    <span className="profile-value">manish0kumar42@gmail.com</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Department:</span>
                    <span className="profile-value">Engineering</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Phone:</span>
                    <span className="profile-value">8864010720</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Address:</span>
                    <span className="profile-value">boral</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Join Date:</span>
                    <span className="profile-value">Apr 30, 2026</span>
                  </div>
                </div>

              </div>
            </div>

          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;


