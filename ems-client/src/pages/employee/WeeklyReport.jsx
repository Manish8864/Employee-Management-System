import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const WeeklyReport = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    weekStartDate: '',
    weekEndDate: '',
    tasksCompleted: '',
    tasksPlanned: '',
    challenges: '',
    reportContent: ''
  });
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);


  useEffect(() => {
    fetchProjects();
    fetchReports();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects/my');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };


  const fetchReports = async () => {
    try {
      const { data } = await api.get('/reports/my');
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const calculateCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return {
      weekStartDate: start.toISOString().split('T')[0],
      weekEndDate: end.toISOString().split('T')[0]
    };
  };

  const handleProjectSelect = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    const project = projects.find(p => p._id === projectId);
    if (project) {
      setFormData({
        ...formData,
        projectId,
        projectName: project.title,
        weekStartDate: calculateCurrentWeek().weekStartDate,
        weekEndDate: calculateCurrentWeek().weekEndDate,
        tasksCompleted: '',
        tasksPlanned: '',
        challenges: '',
        reportContent: ''
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/reports', formData);
      setMessage('Weekly report submitted successfully!');
      fetchReports();
      setFormData({
        ...formData,
        tasksCompleted: '',
        tasksPlanned: '',
        challenges: '',
        reportContent: ''
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error submitting report');
    } finally {
      setLoading(false);
    }
  };


  const closeModal = () => {
    setSelectedReport(null);
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#22c55e';
    if (progress >= 50) return '#eab308';
    if (progress >= 25) return '#f97316';
    return '#ef4444';
  };

  if (loadingProjects) {
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
          <h1 className="dashboard-title">Weekly Report</h1>
          <p className="header-subtitle">Submit and track your weekly project reports</p>
        </div>
      </div>

      {message && (
        <div className={message.includes('Error') ? 'alert alert-error-modern' : 'alert alert-success-modern'}>
          <span className="alert-icon">{message.includes('Error') ? 'X' : 'OK'}</span>
          {message}
        </div>
      )}

      <div className="card card-modern" style={{ maxWidth: '720px', marginBottom: '24px' }}>
        <div className="card-header-modern">
          <h3>Submit Weekly Report</h3>
        </div>
        <div className="card-body-modern">
          <form onSubmit={handleSubmit}>
            <div className="form-group-modern">
              <label className="label-modern">Select Project *</label>
              <select
                name="projectId"
                className="input-modern"
                value={selectedProject}
                onChange={handleProjectSelect}
                required
              >
                <option value="">Choose a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title} - {project.status} ({project.progress}%)
                  </option>
                ))}
              </select>
            </div>

            {selectedProject && (
              <>
                <div className="form-row">
                  <div className="form-group-modern">
                    <label className="label-modern">Week Start Date</label>
                    <input
                      type="date"
                      name="weekStartDate"
                      className="input-modern"
                      value={formData.weekStartDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group-modern">
                    <label className="label-modern">Week End Date</label>
                    <input
                      type="date"
                      name="weekEndDate"
                      className="input-modern"
                      value={formData.weekEndDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-modern">
                  <label className="label-modern">Tasks Completed</label>
                  <textarea
                    name="tasksCompleted"
                    className="input-modern textarea-modern"
                    rows="3"
                    value={formData.tasksCompleted}
                    onChange={handleChange}
                    placeholder="List the tasks you completed this week..."
                    required
                  />
                </div>

                <div className="form-group-modern">
                  <label className="label-modern">Tasks Planned</label>
                  <textarea
                    name="tasksPlanned"
                    className="input-modern textarea-modern"
                    rows="3"
                    value={formData.tasksPlanned}
                    onChange={handleChange}
                    placeholder="List the tasks you plan to do next week..."
                    required
                  />
                </div>

                <div className="form-group-modern">
                  <label className="label-modern">Challenges</label>
                  <textarea
                    name="challenges"
                    className="input-modern textarea-modern"
                    rows="2"
                    value={formData.challenges}
                    onChange={handleChange}
                    placeholder="Describe any challenges faced..."
                  />
                </div>

                <div className="form-group-modern">
                  <label className="label-modern">Report Summary</label>
                  <textarea
                    name="reportContent"
                    className="input-modern textarea-modern"
                    rows="3"
                    value={formData.reportContent}
                    onChange={handleChange}
                    placeholder="Provide a summary of your work this week..."
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary-modern btn-full" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Weekly Report'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      <div className="card card-modern">
        <div className="card-header-modern">
          <h3>My Submitted Reports</h3>
        </div>
        <div className="table-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Project</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-cell">
                    <div className="empty-state">
                      <span className="empty-icon">[ ]</span>
                      <h3>No reports submitted yet</h3>
                      <p>Submit your first weekly report</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id} className="table-row-modern">
                    <td>
                      <span className="project-name">{r.projectName || r.project?.title || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="date-text">
                        {new Date(r.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-info-modern btn-sm"
                        onClick={() => setSelectedReport(r)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReport && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Weekly Report Details</h2>
              <button className="modal-close" onClick={closeModal}>X</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-card">
                  <label className="detail-label">Project</label>
                  <div className="detail-value">{selectedReport.projectName || selectedReport.project?.title || 'N/A'}</div>
                </div>
                <div className="detail-card">
                  <label className="detail-label">Submitted</label>
                  <div className="detail-value">
                    {new Date(selectedReport.submittedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="detail-card full-width">
                  <label className="detail-label">Week</label>
                  <div className="detail-value">
                    {new Date(selectedReport.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(selectedReport.weekEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div className="detail-card full-width">
                  <label className="detail-label">Tasks Completed</label>
                  <div className="report-text">{selectedReport.tasksCompleted || 'N/A'}</div>
                </div>
                <div className="detail-card full-width">
                  <label className="detail-label">Tasks Planned</label>
                  <div className="report-text">{selectedReport.tasksPlanned || 'N/A'}</div>
                </div>
                <div className="detail-card full-width">
                  <label className="detail-label">Challenges</label>
                  <div className="report-text">{selectedReport.challenges || 'None'}</div>
                </div>
                <div className="detail-card full-width">
                  <label className="detail-label">Report Summary</label>
                  <div className="report-text">{selectedReport.reportContent || 'N/A'}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary-modern" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyReport;
