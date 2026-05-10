import React, { useState, useEffect } from 'react';
import api from '../../api/axios';


const ReportsView = () => {
  const [reports, setReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    fetchReports();
    fetchEmployees();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/reports/all');
      setReports(data);
      setError('');
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const filteredReports = filterEmployee
    ? reports.filter(r => r.employee?._id === filterEmployee)
    : reports;

  const getAvatarUrl = (name) => {
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'E') + '&size=64&background=059669&color=fff';
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#22c55e';
    if (progress >= 50) return '#eab308';
    if (progress >= 25) return '#f97316';
    return '#ef4444';
  };


  if (loading) {
    return (
      <div className="page-container-modern">
        <div className="loading-container">
          <div className="spinner-modern"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container-modern">
      <div className="page-header-modern">
        <div className="header-left">
          <h1 className="dashboard-title">Employee Reports</h1>
          <p className="header-subtitle">{filteredReports.length} reports total</p>
        </div>
        <button className="btn btn-secondary-modern" onClick={fetchReports}>
          <span>R</span> Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error-modern">
          <span className="alert-icon">X</span>
          {error}
        </div>
      )}

      <div className="card card-modern filters-card">
        <div className="filter-row">
          <div className="form-group-modern" style={{ flex: 1, maxWidth: '320px' }}>
            <label className="label-modern">Filter by Employee</label>
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
        </div>
      </div>

      {!error && filteredReports.length === 0 && (
        <div className="card card-modern text-center p-5">
          <div className="empty-state">
            <span className="empty-icon">[ ]</span>
            <h3>No reports found</h3>
            <p>Try adjusting your filters</p>
          </div>
        </div>
      )}

      {!error && filteredReports.map((report) => {
        const progress = report.project?.progress || 0;
        const progressColor = getProgressColor(progress);
        return (
          <div key={report._id} className="card card-modern report-card">
            <div className="report-header">
              <div className="report-title-section">
                <h3 className="report-title">{report.projectName || report.project?.title || 'N/A'}</h3>
                <div className="report-meta">
                  <img src={getAvatarUrl(report.employee?.name)} alt={report.employee?.name} className="report-avatar" />
                  <div>
                    <span className="report-author">By: {report.employee?.name || 'N/A'}</span>
                    <span className="report-week">
                      Week: {new Date(report.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(report.weekEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>


            {report.project && (
              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-label">Project Progress</span>
                  <span className="progress-value" style={{ color: progressColor }}>{progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: progress + '%', backgroundColor: progressColor }}
                  ></div>
                </div>
              </div>
            )}

            <div className="report-content-grid">
              <div className="report-section">
                <h4 className="report-section-title">Tasks Completed</h4>
                <div className="report-text-box">{report.tasksCompleted || 'N/A'}</div>
              </div>
              
              <div className="report-section">
                <h4 className="report-section-title">Tasks Planned</h4>
                <div className="report-text-box">{report.tasksPlanned || 'N/A'}</div>
              </div>

              {report.challenges && (
                <div className="report-section">
                  <h4 className="report-section-title">Challenges</h4>
                  <div className="report-text-box">{report.challenges}</div>
                </div>
              )}


              <div className="report-section full-width">
                <h4 className="report-section-title">Report Summary</h4>
                <div className="report-text-box">{report.reportContent || 'N/A'}</div>
              </div>
            </div>

            <div className="report-footer">
              <span className="submitted-date">
                Submitted: {new Date(report.submittedAt).toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportsView;
