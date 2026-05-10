import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const EmployeeLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get('/leaves/my');
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      await api.post('/leaves/apply', formData);
      setMessage('Leave applied successfully!');
      setFormData({
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        reason: ''
      });
      fetchLeaves();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error applying for leave');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'approved': { bg: '#dcfce7', color: '#15803d' },
      'rejected': { bg: '#fee2e2', color: '#dc2626' },
      'pending': { bg: '#fef3c7', color: '#b45309' }
    };
    return colors[status] || colors.pending;
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      'annual': { bg: '#dcfce7', color: '#15803d' },
      'sick': { bg: '#fce7f3', color: '#be185d' },
      'casual': { bg: '#dbeafe', color: '#1d4ed8' },
      'unpaid': { bg: '#f3f4f6', color: '#6b7280' }
    };
    return colors[type] || colors.casual;
  };

  if (fetchLoading) {
    return (
      <div className="page-container-modern">
        <div className="loading-container">
          <div className="spinner-modern"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container-modern">
      <div className="page-header-modern">
        <div className="header-left">
          <h1 className="dashboard-title">Leave</h1>
          <p className="header-subtitle">Apply for leave and track your history</p>
        </div>
      </div>

      {message && (
        <div className={message.includes('Error') ? 'alert alert-error-modern' : 'alert alert-success-modern'}>
          <span className="alert-icon">{message.includes('Error') ? 'X' : 'OK'}</span>
          {message}
        </div>
      )}


      <div className="card card-modern leave-apply-form" style={{ marginBottom: '24px' }}>

        <div className="card-header-modern">
          <h3>Apply for Leave</h3>
        </div>
        <div className="card-body-modern">
          <form onSubmit={handleSubmit}>
            <div className="form-group-modern">
              <label className="label-modern">Leave Type</label>
              <select
                name="leaveType"
                className="input-modern"
                value={formData.leaveType}
                onChange={handleChange}
                required
              >
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="casual">Casual Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group-modern">
                <label className="label-modern">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="input-modern"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-modern">
                <label className="label-modern">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  className="input-modern"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label className="label-modern">Reason</label>
              <textarea
                name="reason"
                className="input-modern textarea-modern"
                rows="3"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter reason for leave..."
                required
              />
            </div>

            <button type="submit" className="btn btn-primary-modern btn-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Apply Leave'}
            </button>
          </form>
        </div>
      </div>

      <div className="card card-modern">
        <div className="card-header-modern">
          <h3>My Leave History</h3>
        </div>
        <div className="table-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    <div className="empty-state">
                      <span className="empty-icon">[ ]</span>
                      <h3>No leave records found</h3>
                      <p>Apply for your first leave</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => {
                  const statusColor = getStatusColor(leave.status);
                  const typeColor = getLeaveTypeColor(leave.leaveType);
                  return (
                    <tr key={leave._id} className="table-row-modern">
                      <td>
                        <span className="type-badge" style={{ backgroundColor: typeColor.bg, color: typeColor.color }}>
                          {leave.leaveType}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td>
                        <span className="reason-text" title={leave.reason}>
                          {leave.reason && leave.reason.length > 25 ? leave.reason.substring(0, 25) + '...' : leave.reason}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: statusColor.bg, color: statusColor.color }}>
                          {leave.status}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {new Date(leave.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeave;
