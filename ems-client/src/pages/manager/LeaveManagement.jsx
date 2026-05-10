import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchLeaves();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchLeaves = async () => {
    try {
      let url = '/leaves/all';
      const params = new URLSearchParams();
      if (filterEmployee) params.append('employeeId', filterEmployee);
      if (filterStatus) params.append('status', filterStatus);
      if (params.toString()) url += '?' + params.toString();
      const { data } = await api.get(url);
      setLeaves(data);
      setError('');
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setError(error.response?.data?.message || 'Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await api.put('/leaves/' + id + '/status', { status });
      setMessage('Leave ' + status + ' successfully!');
      fetchLeaves();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating leave status');
    }
  };

  const handleFilter = () => {
    fetchLeaves();
  };

  const resetFilters = () => {
    setFilterEmployee('');
    setFilterStatus('');
    fetchLeaves();
  };

  const getStatusColor = (status) => {
    const colors = {
      'approved': { bg: '#dcfce7', color: '#15803d', icon: 'Y' },
      'rejected': { bg: '#fee2e2', color: '#dc2626', icon: 'N' },
      'pending': { bg: '#fef3c7', color: '#b45309', icon: 'P' }
    };
    return colors[status] || colors.pending;
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      'sick': { bg: '#fce7f3', color: '#be185d' },
      'casual': { bg: '#dbeafe', color: '#1d4ed8' },
      'earned': { bg: '#dcfce7', color: '#15803d' },
      'unpaid': { bg: '#f3f4f6', color: '#6b7280' }
    };
    return colors[type] || { bg: '#f3f4f6', color: '#6b7280' };
  };

  const getAvatarUrl = (name) => {
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'E') + '&size=64&background=7c3aed&color=fff';
  };

  if (loading) {
    return (
      <div className="page-container-modern">
        <div className="loading-container">
          <div className="spinner-modern"></div>
          <p>Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container-modern">
      <div className="page-header-modern">
        <div className="header-left">
          <h1 className="dashboard-title">Leave Management</h1>
          <p className="header-subtitle">Total Leaves: {leaves.length}</p>
        </div>
      <button className="btn btn-secondary-modern" onClick={fetchLeaves}>
        Refresh
      </button>
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

      <div className="card card-modern filters-card">
        <div className="filters-grid-3">
          <div className="form-group-modern">
            <label className="label-modern">Employee</label>
            <select
              className="input-modern"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group-modern">
            <label className="label-modern">Status</label>
            <select
              className="input-modern"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="filter-buttons">
            <button className="btn btn-primary-modern" onClick={handleFilter}>
              Filter
            </button>
            <button className="btn btn-secondary-modern" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="card card-modern">
        <div className="table-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th style={{ minWidth: '180px' }}>Employee</th>
                <th>Type</th>
                <th>Applied</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th style={{ minWidth: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    <div className="empty-state">
                      <span className="empty-icon">[ ]</span>
                      <h3>No leave requests found</h3>
                      <p>Try adjusting your filters</p>
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
                        <div className="employee-cell">
                          <img src={getAvatarUrl(leave.employee?.name)} alt={leave.employee?.name} className="table-avatar-small" />
                          <span className="employee-name">{leave.employee?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="type-badge" style={{ backgroundColor: typeColor.bg, color: typeColor.color }}>
                          {leave.leaveType}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {new Date(leave.appliedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {new Date(leave.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {new Date(leave.endDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td>
                        <span className="reason-text" title={leave.reason}>
                          {leave.reason && leave.reason.length > 30 ? leave.reason.substring(0, 30) + '...' : leave.reason || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: statusColor.bg, color: statusColor.color }}>
                          <span className="status-icon"></span>
                          {leave.status}
                        </span>
                      </td>
                      <td>
                        {leave.status === 'pending' ? (
                          <div className="action-group">
                            <button
                              className="btn btn-success-modern btn-sm"
                              onClick={() => handleAction(leave._id, 'approved')}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger-modern btn-sm"
                              onClick={() => handleAction(leave._id, 'rejected')}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="action-done">-</span>
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
    </div>
  );
};

export default LeaveManagement;
