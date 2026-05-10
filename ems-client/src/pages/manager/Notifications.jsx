import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('send');
  const [formData, setFormData] = useState({
    message: '',
    type: 'general',
    targetType: 'all-employees',
    targetEmployeeId: ''
  });
  const [employees, setEmployees] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

      const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
let url = '/notifications/my';
          if (selectedDate) {
            url += `?date=${selectedDate}`;
          }
          const res = await api.get(url);
          setHistory(res.data.notifications || res.data || res.data.data || []);
        } catch (err) {
          console.error('History error:', err);
          setHistory([]);  // Clear history on error
        } finally {
          setHistoryLoading(false);
        }
      };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        message: formData.message,
        type: formData.type,
        targetType: formData.targetType
      };
      if (formData.targetType === 'specific-employee' && formData.targetEmployeeId) {
        payload.targetEmployeeId = formData.targetEmployeeId;
      }

      await api.post('/notifications', payload);
      setSuccess('Notification sent successfully!');
      setFormData({
        message: '',
        type: 'general',
        targetType: 'all-employees',
        targetEmployeeId: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredHistory = selectedDate
    ? history.filter(n => new Date(n.createdAt).toISOString().split('T')[0] === selectedDate)
    : history;

  const getTypeColor = (type) => {
    const colors = {
      'general': { bg: '#dbeafe', color: '#1d4ed8' },
      'project': { bg: '#dcfce7', color: '#15803d' },
      'info': { bg: '#fef3c7', color: '#b45309' },
      'urgent': { bg: '#fee2e2', color: '#dc2626' }
    };
    return colors[type] || colors.general;
  };

  const getTargetDisplay = (targetType, targetEmployeeId, employees) => {
    if (targetType === 'all-employees') return 'All Employees';
    if (targetType === 'all-including-managers') return 'All Users';
    if (targetType === 'specific-employee') {
      const emp = employees.find(e => e._id === targetEmployeeId);
      return emp ? emp.name : 'Unknown Employee';
    }
    return 'Unknown';
  };

  return (
    <div className="page-container-modern">
      <div className="page-header-modern">
        <div className="header-left">
          <h1 className="dashboard-title">Notifications</h1>
          <p className="header-subtitle">Send notifications and view history</p>
        </div>
      </div>

      {success && (
        <div className="alert alert-success-modern">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="alert alert-error-modern">
          ✗ {error}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-modern">
        <button 
          className={`tab-button ${activeTab === 'send' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('send')}
        >
          Send Notification
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {/* SEND TAB */}
      {activeTab === 'send' && (
        <div className="form-section-modern">
          <div className="card card-modern">
            <div className="card-header-modern">
              <h3>📢 Send New Notification</h3>
            </div>
            <div className="card-body-modern">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group-modern">
                    <label className="label-modern">Type</label>
                    <select 
                      name="type" 
                      className="input-modern" 
                      value={formData.type} 
                      onChange={handleInputChange}
                    >
                      <option value="general">General</option>
                      <option value="project">Project Update</option>
                      <option value="info">Information</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="form-group-modern">
                    <label className="label-modern">Target</label>
                    <select 
                      name="targetType" 
                      className="input-modern" 
                      value={formData.targetType} 
                      onChange={handleInputChange}
                    >
                      <option value="all-employees">All Employees</option>
                      <option value="all-including-managers">All Users</option>
                      <option value="specific-employee">Specific Employee</option>
                    </select>
                  </div>
                </div>

                {formData.targetType === 'specific-employee' && (
                  <div className="form-group-modern">
                    <label className="label-modern">Select Employee</label>
                    <select 
                      name="targetEmployeeId"
                      className="input-modern"
                      value={formData.targetEmployeeId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Choose employee...</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} ({emp.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group-modern">
                  <label className="label-modern">Message <span className="required">*</span></label>
                  <textarea
                    name="message"
                    className="input-modern textarea-modern"
                    rows="6"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your notification message..."
                    maxLength="1000"
                    required
                  />
                  <small className="char-count">
                    {formData.message.length}/1000
                  </small>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary-modern btn-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    'Send Notification'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div>
          <div className="card card-modern">
            <div className="card-header-modern">
              <h3>📋 Notification History</h3>
            </div>
            <div className="card-body-modern">
              <div className="form-row" style={{ marginBottom: '24px' }}>
                <div className="form-group-modern" style={{ maxWidth: '300px' }}>
                  <label className="label-modern">Filter by Date</label>
                  <input
                    type="date"
                    className="input-modern"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'end', gap: '12px' }}>
                  <button 
                    className="btn btn-primary-modern" 
                    onClick={fetchHistory}
                    disabled={historyLoading}
                  >
                    Filter
                  </button>
                  <button 
                    className="btn btn-secondary-modern" 
                    onClick={() => {
                      setSelectedDate('');
                      fetchHistory();
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {historyLoading ? (
                <div className="loading-modern" style={{ textAlign: 'center', padding: '60px' }}>
                  Loading history...
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="empty-state" style={{ padding: '80px 40px', textAlign: 'center' }}>
                  <span className="empty-icon">[ ]</span>
                  <h3>No notifications found</h3>
                  <p>{selectedDate ? 'No notifications for this date' : 'No notification history available'}</p>
                </div>
              ) : (
                <div className="history-list">
                  {filteredHistory.map((notification) => {
                    const typeColor = getTypeColor(notification.type);
                    const targetDisplay = getTargetDisplay(
                      notification.targetType, 
                      notification.targetEmployeeId, 
                      employees
                    );
                    return (
                      <div 
                        key={notification._id} 
                        className="history-card-modern"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedNotification(notification);
                          setShowDetailModal(true);
                        }}
                      >
                        <div className="history-header">
                          <span className="type-badge" style={{ 
                            backgroundColor: typeColor.bg, 
                            color: typeColor.color,
                            marginRight: '12px'
                          }}>
                            {notification.type.toUpperCase()}
                          </span>
                          <span className="notif-title" style={{ fontWeight: '600' }}>
                            {notification.title || 'Notification'}
                          </span>
                        </div>
                        <div className="notif-meta" style={{ marginTop: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>
                          <span>To: {targetDisplay}</span>
                          <span style={{ marginLeft: '16px' }}>
                            {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedNotification && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ margin: 0 }}>Notification Details</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-card full-width">
                  <label className="detail-label">Message</label>
                  <div className="detail-value" style={{ whiteSpace: 'pre-wrap', fontSize: '1rem' }}>
                    {selectedNotification.message}
                  </div>
                </div>
                <div className="detail-card">
                  <label className="detail-label">Type</label>
                  <div className="detail-value">
                    <span className="type-badge" style={{ 
                      backgroundColor: getTypeColor(selectedNotification.type).bg,
                      color: getTypeColor(selectedNotification.type).color
                    }}>
                      {selectedNotification.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="detail-card">
                  <label className="detail-label">Target</label>
                  <div className="detail-value">
                    {getTargetDisplay(
                      selectedNotification.targetType,
                      selectedNotification.targetEmployeeId,
                      employees
                    )}
                  </div>
                </div>
                <div className="detail-card">
                  <label className="detail-label">Sent At</label>
                  <div className="detail-value">
                    {new Date(selectedNotification.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;

