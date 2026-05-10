import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const AllEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      const { data } = await api.get(`/employees/${id}`);
      setSelectedEmployee(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      setMessage('Employee removed successfully');
      setDeleteConfirm(null);
      fetchEmployees();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove employee');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getDisplayId = (emp) => {
    return emp.empId || emp._id.slice(-6);
  };

  const getAvatarUrl = (avatar, name) => {
    if (!avatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'E')}&size=128&background=4F46E5&color=fff`;
    }
    return avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`;
  };

  const getDepartmentColor = (dept) => {
    const colors = {
      'Engineering': { bg: '#dbeafe', color: '#1d4ed8' },
      'Design': { bg: '#fce7f3', color: '#be185d' },
      'Marketing': { bg: '#dcfce7', color: '#15803d' },
      'HR': { bg: '#fef3c7', color: '#b45309' },
      'Finance': { bg: '#e0e7ff', color: '#4338ca' },
      'Sales': { bg: '#ffedd5', color: '#c2410c' }
    };
    return colors[dept] || { bg: '#f3f4f6', color: '#6b7280' };
  };

  const departments = ['all', ...new Set(employees.map(e => e.department).filter(Boolean))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getDisplayId(emp).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'all' || emp.department === filterDept;
    return matchesSearch && matchesDept;
  });

  if (loading) {
    return (
      <div className="employees-page">
        <div className="loading-container">
          <div className="spinner-modern"></div>
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employees-page">
      <div className="page-header-modern">
        <div className="header-left">
          <h1 className="dashboard-title">All Employees</h1>
          <p className="header-subtitle">{filteredEmployees.length} employees total</p>
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

      <div className="employees-filters">
        <div className="emp-search-box">
          <span className="emp-search-icon">Q</span>
          <input
            type="text"
            className="input-modern"
            placeholder="Search by name, email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="emp-filter-select">
          <select
            className="input-modern"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.filter(d => d !== 'all').map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="employees-card">
        <div >
          <table className="employees-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>ID</th>
                <th>Department</th>
                <th>Role</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    <div className="empty-state">
                      <span className="empty-icon">[ ]</span>
                      <h3>No employees found</h3>
                      <p>Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const deptColor = getDepartmentColor(emp.department);
                  return (
                    <tr key={emp._id} className="table-row-modern">
                      <td>
                        <img
                          src={getAvatarUrl(emp.avatar, emp.name)}
                          alt={emp.name}
                          className="employee-avatar"
                        />
                      </td>
                      <td>
                        <span className="emp-name">{emp.name}</span>
                      </td>
                      <td>
                        <span className="emp-email">{emp.email}</span>
                      </td>
                      <td>
                        <code className="emp-id">{getDisplayId(emp)}</code>
                      </td>
                      <td>
                        <span className="emp-dept-badge" style={{ backgroundColor: deptColor.bg, color: deptColor.color }}>
                          {emp.department || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`role-badge ${emp.role}`}>
                          {emp.role}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {new Date(emp.joinDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td>
                        {deleteConfirm === emp._id ? (
                          <div className="action-group">
                            <button
                              className="emp-btn emp-btn-remove"
                              onClick={() => handleDelete(emp._id)}
                            >
                              OK Confirm
                            </button>
                            <button
                              className="emp-btn emp-btn-cancel"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              X Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="action-group">
                            <button
                              className="emp-btn emp-btn-view"
                              onClick={() => viewDetails(emp._id)}
                            >
                              View
                            </button>
                            <button
                              className="emp-btn emp-btn-remove"
                              onClick={() => setDeleteConfirm(emp._id)}
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

      {showModal && selectedEmployee && (
        <div className="modal-overlay emp-profile-modal" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <img
                  src={getAvatarUrl(selectedEmployee.avatar, selectedEmployee.name)}
                  alt={selectedEmployee.name}
                  className="modal-avatar"
                />
                <div>
                  <h2>{selectedEmployee.name}</h2>
                  <span className={`role-badge ${selectedEmployee.role}`}>
                    {selectedEmployee.role}
                  </span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-card">
                  <label className="detail-label">Employee ID</label>
                  <div className="detail-value"><code>{getDisplayId(selectedEmployee)}</code></div>
                </div>
                <div className="detail-card">
                  <label className="detail-label">Email</label>
                  <div className="detail-value">{selectedEmployee.email}</div>
                </div>
                <div className="detail-card">
                  <label className="detail-label">Department</label>
                  <div className="detail-value">{selectedEmployee.department || 'N/A'}</div>
                </div>
                <div className="detail-card">
                  <label className="detail-label">Phone</label>
                  <div className="detail-value">{selectedEmployee.phone || 'N/A'}</div>
                </div>
                <div className="detail-card full-width">
                  <label className="detail-label">Address</label>
                  <div className="detail-value">{selectedEmployee.address || 'N/A'}</div>
                </div>
                <div className="detail-card">
                  <label className="detail-label">Join Date</label>
                  <div className="detail-value">
                    {new Date(selectedEmployee.joinDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="detail-card">
                  <label className="detail-label">Date of Birth</label>
                  <div className="detail-value">
                    {selectedEmployee.dob ? new Date(selectedEmployee.dob).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary-modern" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEmployees;

