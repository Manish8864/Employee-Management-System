import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AllManagers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', department: '', phone: '', address: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const MAX_MANAGERS = 5;

  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [addManagerLoading, setAddManagerLoading] = useState(false);
  const [addManagerForm, setAddManagerForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    phone: '',
    address: ''
  });
  const [addManagerMsg, setAddManagerMsg] = useState('');

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/managers');
      setManagers(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch managers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setCurrentUser(res.data);
      setProfileForm({
        name: res.data.name || '',
        email: res.data.email || '',
        department: res.data.department || '',
        phone: res.data.phone || '',
        address: res.data.address || ''
      });
    } catch (err) {
      console.error('Failed to fetch current user');
    }
  };

  useEffect(() => {
    fetchManagers();
    fetchCurrentUser();
  }, []);

  const handleViewDetails = async (manager) => {
    try {
      setDetailsLoading(true);
      const res = await api.get(`/auth/managers/${manager._id}`);
      setSelectedManager(res.data);
      setProfileForm({
        name: res.data.name || '',
        email: res.data.email || '',
        department: res.data.department || '',
        phone: res.data.phone || '',
        address: res.data.address || ''
      });
      setShowDetailsModal(true);
      setIsOwnProfile(currentUser && currentUser._id === manager._id);
      setEditProfileMode(false);
      setProfileMsg('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch manager details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/auth/managers/${id}`);
      setMessage('Manager deleted successfully');
      setDeleteConfirm(null);
      fetchManagers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete manager');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      await api.put(`/auth/managers/${selectedManager._id}`, profileForm);
      setProfileMsg('Profile updated successfully!');
      setEditProfileMode(false);
      const res = await api.get(`/auth/managers/${selectedManager._id}`);
      setSelectedManager(res.data);
      fetchCurrentUser();
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileMsg(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleAddManagerChange = (e) => {
    setAddManagerForm({ ...addManagerForm, [e.target.name]: e.target.value });
  };

  const handleAddManagerSubmit = async (e) => {
    e.preventDefault();
    setAddManagerMsg('');

    if (managers.length >= MAX_MANAGERS) {
      setAddManagerMsg(`Maximum ${MAX_MANAGERS} managers allowed`);
      return;
    }

    setAddManagerLoading(true);
    try {
      await api.post('/auth/add-manager', addManagerForm);
      setAddManagerMsg('Manager added successfully');
      setShowAddManagerModal(false);
      setAddManagerForm({ name: '', email: '', password: '', department: '', phone: '', address: '' });
      fetchManagers();
      setTimeout(() => setAddManagerMsg(''), 3000);
    } catch (err) {
      setAddManagerMsg(err.response?.data?.message || 'Failed to add manager');
    } finally {
      setAddManagerLoading(false);
    }
  };

  const getAvatarUrl = (avatar, name) => {
    if (!avatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'M')}&size=128&background=7c3aed&color=fff`;
    }
    return avatar.startsWith('http') ? avatar : `${import.meta.env.VITE_UPLOADS_BASE_URL || ''}${avatar}`;
  };

  const getDepartmentColor = (dept) => {
    const colors = {
      'Management': { bg: '#fef3c7', color: '#b45309' },
      'Engineering': { bg: '#dbeafe', color: '#1d4ed8' },
      'HR': { bg: '#dcfce7', color: '#15803d' },
      'Finance': { bg: '#e0e7ff', color: '#4338ca' }
    };
    return colors[dept] || { bg: '#f3f4f6', color: '#6b7280' };
  };

  const filteredManagers = managers.filter(manager =>
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-container-modern">
        <div className="loading-container">
          <div className="spinner-modern"></div>
          <p>Loading managers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container-modern">
      <div className="page-header-modern">
        <div className="header-left">
          <h1 className="dashboard-title">All Managers</h1>
          <p className="header-subtitle">{managers.length} / 5 managers total</p>
        </div>

        <div className="header-right">
          <button
            className="btn btn-primary-modern"
            disabled={managers.length >= 5 || loading}
            onClick={() => setShowAddManagerModal(true)}
            style={{ opacity: managers.length >= 5 ? 0.6 : 1 }}
            title={managers.length >= 5 ? 'Maximum 5 managers allowed' : 'Add a new manager'}
          >
            + Add Manager
          </button>
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

      <div className="filters-bar">
        <div className="search-box" style={{ maxWidth: '400px' }}>
          <span className="search-icon">Q</span>
          <input
            type="text"
            className="input-modern"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showAddManagerModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowAddManagerModal(false);
            setAddManagerMsg('');
          }}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>Add Manager</h2>
                <span className="role-badge manager">Manager</span>
              </div>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddManagerModal(false);
                  setAddManagerMsg('');
                }}
              >
                X
              </button>
            </div>

            <div className="modal-body">
              {addManagerMsg && (
                <div className={addManagerMsg.toLowerCase().includes('maximum') ? 'alert alert-error-modern' : 'alert alert-success-modern'} style={{ marginBottom: '20px' }}>
                  <span className="alert-icon">{addManagerMsg.toLowerCase().includes('maximum') ? 'X' : 'OK'}</span>
                  {addManagerMsg}
                </div>
              )}

              <form onSubmit={handleAddManagerSubmit}>
                <div className="form-group-modern">
                  <label className="label-modern">Name <span className="required">*</span></label>
                  <input type="text" name="name" className="input-modern" value={addManagerForm.name} onChange={handleAddManagerChange} required />
                </div>

                <div className="form-group-modern">
                  <label className="label-modern">Email <span className="required">*</span></label>
                  <input type="email" name="email" className="input-modern" value={addManagerForm.email} onChange={handleAddManagerChange} required />
                </div>

                <div className="form-group-modern">
                  <label className="label-modern">Password <span className="required">*</span></label>
                  <input type="password" name="password" className="input-modern" value={addManagerForm.password} onChange={handleAddManagerChange} required minLength="6" />
                </div>

                <div className="form-row">
                  <div className="form-group-modern">
                    <label className="label-modern">Department</label>
                    <input type="text" name="department" className="input-modern" value={addManagerForm.department} onChange={handleAddManagerChange} />
                  </div>
                  <div className="form-group-modern">
                    <label className="label-modern">Phone</label>
                    <input type="text" name="phone" className="input-modern" value={addManagerForm.phone} onChange={handleAddManagerChange} />
                  </div>
                </div>

                <div className="form-group-modern">
                  <label className="label-modern">Address</label>
                  <textarea name="address" className="input-modern textarea-modern" rows="3" value={addManagerForm.address} onChange={handleAddManagerChange} />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary-modern" disabled={addManagerLoading || managers.length >= MAX_MANAGERS}>
                    {addManagerLoading ? 'Adding...' : '+ Add Manager'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary-modern"
                    onClick={() => {
                      setShowAddManagerModal(false);
                      setAddManagerMsg('');
                    }}
                    disabled={addManagerLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="card card-modern">
        <div className="table-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredManagers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    <div className="empty-state">
                      <span className="empty-icon">[ ]</span>
                      <h3>No managers found</h3>
                      <p>Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredManagers.map((manager) => {
                  const deptColor = getDepartmentColor(manager.department);
                  return (
                    <tr key={manager._id} className="table-row-modern">
                      <td>
                        <img
                          src={getAvatarUrl(manager.avatar, manager.name)}
                          alt={manager.name}
                          className="employee-avatar"
                        />
                      </td>
                      <td>
                        <span className="employee-name">{manager.name}</span>
                      </td>
                      <td>
                        <span className="employee-email">{manager.email}</span>
                      </td>
                      <td>
                        <span className="dept-badge" style={{ backgroundColor: deptColor.bg, color: deptColor.color }}>
                          {manager.department || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="table-text">{manager.phone || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="table-text address-cell" title={manager.address}>
                          {manager.address ? (manager.address.length > 25 ? manager.address.substring(0, 25) + '...' : manager.address) : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {new Date(manager.joinDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td>
                        {deleteConfirm === manager._id ? (
                          <div className="action-group">
                            <button
                              className="btn btn-danger-modern btn-sm"
                              onClick={() => handleDelete(manager._id)}
                            >
                              OK Confirm
                            </button>
                            <button
                              className="btn btn-secondary-modern btn-sm"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              X Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="action-group">
                            <button
                              className="btn btn-info-modern btn-sm"
                              onClick={() => handleViewDetails(manager)}
                            >
                              View
                            </button>
                            <button
                              className="btn btn-danger-modern btn-sm"
                              onClick={() => setDeleteConfirm(manager._id)}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailsModal && (
        <div className="modal-overlay" onClick={() => { setShowDetailsModal(false); setEditProfileMode(false); }}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                {selectedManager && (
                  <>
                    <img
                      src={getAvatarUrl(selectedManager.avatar, selectedManager.name)}
                      alt={selectedManager.name}
                      className="modal-avatar"
                    />
                    <div>
                      <h2>{selectedManager.name}</h2>
                      <span className="role-badge manager">Manager</span>
                    </div>
                  </>
                )}
              </div>
              <button className="modal-close" onClick={() => { setShowDetailsModal(false); setEditProfileMode(false); }}>X</button>
            </div>
            <div className="modal-body">
              {detailsLoading ? (
                <div className="loading-container">
                  <div className="spinner-modern"></div>
                  <p>Loading...</p>
                </div>
              ) : selectedManager ? (
                !editProfileMode ? (
                  <>
                    {profileMsg && (
                      <div className="alert alert-success-modern" style={{ marginBottom: '20px' }}>
                        <span className="alert-icon">OK</span>
                        {profileMsg}
                      </div>
                    )}
                    <div className="detail-grid">
                      <div className="detail-card">
                        <label className="detail-label">Employee ID</label>
                        <div className="detail-value"><code>{selectedManager.empId || 'N/A'}</code></div>
                      </div>
                      <div className="detail-card">
                        <label className="detail-label">Email</label>
                        <div className="detail-value">{selectedManager.email}</div>
                      </div>
                      <div className="detail-card">
                        <label className="detail-label">Department</label>
                        <div className="detail-value">{selectedManager.department || 'N/A'}</div>
                      </div>
                      <div className="detail-card">
                        <label className="detail-label">Phone</label>
                        <div className="detail-value">{selectedManager.phone || 'N/A'}</div>
                      </div>
                      <div className="detail-card full-width">
                        <label className="detail-label">Address</label>
                        <div className="detail-value">{selectedManager.address || 'N/A'}</div>
                      </div>
                      <div className="detail-card">
                        <label className="detail-label">Join Date</label>
                        <div className="detail-value">
                          {selectedManager.joinDate ? new Date(selectedManager.joinDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'N/A'}
                        </div>
                      </div>
                    </div>
                    {isOwnProfile && (
                      <button
                        className="btn btn-primary-modern btn-full"
                        style={{ marginTop: '20px' }}
                        onClick={() => setEditProfileMode(true)}
                      >
                        Edit My Profile
                      </button>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleProfileSubmit}>
                    <h4 style={{ marginBottom: '20px', color: '#1e293b' }}>Edit Profile</h4>
                    <div className="form-group-modern">
                      <label className="label-modern">Name</label>
                      <input type="text" name="name" className="input-modern" value={profileForm.name || ''} onChange={handleProfileChange} />
                    </div>
                    <div className="form-group-modern">
                      <label className="label-modern">Email</label>
                      <input type="email" name="email" className="input-modern" value={profileForm.email || ''} onChange={handleProfileChange} />
                    </div>
                    <div className="form-group-modern">
                      <label className="label-modern">Department</label>
                      <input type="text" name="department" className="input-modern" value={profileForm.department || ''} onChange={handleProfileChange} />
                    </div>
                    <div className="form-group-modern">
                      <label className="label-modern">Phone</label>
                      <input type="text" name="phone" className="input-modern" value={profileForm.phone || ''} onChange={handleProfileChange} />
                    </div>
                    <div className="form-group-modern">
                      <label className="label-modern">Address</label>
                      <textarea name="address" className="input-modern textarea-modern" rows="3" value={profileForm.address || ''} onChange={handleProfileChange} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button type="submit" className="btn btn-primary-modern">Save Profile</button>
                      <button type="button" className="btn btn-secondary-modern" onClick={() => setEditProfileMode(false)}>Cancel</button>
                    </div>
                  </form>
                )
              ) : (
                <p>No details available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllManagers;
