import React, { useState, useEffect } from 'react';
import api from '../../api/axios';


const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [statusValue, setStatusValue] = useState('');


  useEffect(() => {
    fetchProjects();
  }, []);


  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects/my');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const openProgressModal = (project) => {
    setEditingProject(project);
    setProgressValue(project.progress);
    setShowProgressModal(true);
  };


  const openStatusModal = (project) => {
    setEditingProject(project);
    setStatusValue(project.status);
    setShowStatusModal(true);
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    try {
      await api.put('/projects/my/' + editingProject._id, { progress: progressValue });
      setShowProgressModal(false);
      fetchProjects();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.put('/projects/my/' + editingProject._id, { status: statusValue });
      setShowStatusModal(false);
      fetchProjects();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': { bg: '#dcfce7', color: '#15803d' },
      'completed': { bg: '#dbeafe', color: '#1d4ed8' },
      'on-hold': { bg: '#fef3c7', color: '#b45309' },
      'cancelled': { bg: '#fee2e2', color: '#dc2626' }
    };
    return colors[status] || colors.active;
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#22c55e';
    if (progress >= 50) return '#eab308';
    if (progress >= 25) return '#f97316';
    return '#ef4444';
  };

  const getAvatarUrl = (name) => {
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'M') + '&size=64&background=7c3aed&color=fff';
  };


  if (loading) {
    return (
      <div className="page-container-modern">
        <div className="loading-container">
          <div className="spinner-modern"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container-modern">
      <div className="page-header-modern">
        <div className="header-left">
          <h1 className="dashboard-title">My Projects</h1>
          <p className="header-subtitle">{projects.length} project(s) assigned</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="card card-modern text-center p-5">
          <div className="empty-state">
            <span className="empty-icon">[ ]</span>
            <h3>No projects assigned yet</h3>
            <p>Your assigned projects will appear here</p>
          </div>
        </div>
      ) : (
        projects.map((project) => {
          const statusColor = getStatusColor(project.status);
          const progressColor = getProgressColor(project.progress);
          return (
            <div key={project._id} className="card card-modern project-card">
              <div className="project-header">
                <div>
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                </div>
                <span className="status-badge-lg" style={{ backgroundColor: statusColor.bg, color: statusColor.color }}>
                  {project.status}
                </span>
              </div>

              <div className="project-details">
                <div className="detail-item">
                  <div className="manager-info">
                    <img src={getAvatarUrl(project.manager?.name)} alt={project.manager?.name} className="manager-avatar" />
                    <div>
                      <span className="detail-label">Manager</span>
                      <span className="manager-name">{project.manager?.name}</span>
                      <span className="manager-email">{project.manager?.email}</span>
                    </div>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Start Date</span>
                  <span className="detail-value">
                    {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">End Date</span>
                  <span className="detail-value">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                  </span>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-label">Progress</span>
                  <span className="progress-value" style={{ color: progressColor }}>{project.progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: project.progress + '%', backgroundColor: progressColor }}
                  ></div>
                </div>
              </div>

              <div className="project-actions">
                <button className="btn btn-primary-modern" onClick={() => openProgressModal(project)}>
                  Update Progress
                </button>
                <button className="btn btn-info-modern" onClick={() => openStatusModal(project)}>
                  Update Status
                </button>
              </div>
            </div>
          );
        })
      )}

      {showProgressModal && (
        <div className="modal-overlay" onClick={() => setShowProgressModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Progress</h2>
              <button className="modal-close" onClick={() => setShowProgressModal(false)}>X</button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">Update progress for {editingProject?.title}</p>
              <form onSubmit={handleUpdateProgress}>
                <div className="progress-slider">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressValue}
                    onChange={(e) => setProgressValue(Number(e.target.value))}
                    className="range-slider"
                  />
                  <div className="range-value" style={{ color: getProgressColor(progressValue) }}>
                    {progressValue}%
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary-modern" onClick={() => setShowProgressModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-modern">
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Status</h2>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>X</button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">Update status for {editingProject?.title}</p>
              <form onSubmit={handleUpdateStatus}>
                <div className="form-group-modern">
                  <label className="label-modern">Status</label>
                  <select
                    className="input-modern"
                    value={statusValue}
                    onChange={(e) => setStatusValue(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary-modern" onClick={() => setShowStatusModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-modern">
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProjects;
