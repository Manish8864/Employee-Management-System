import React, { useState, useEffect } from 'react';
import api from '../../api/axios';


const AssignProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    startDate: '',
    endDate: ''
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      setEmployees(data);
    } catch (err) {
      setError('Failed to load employees');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/projects', formData);
      setMessage('Project assigned successfully!');
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        startDate: '',
        endDate: ''
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container-modern">
      <div className="page-header-modern">
        <div className="header-left">
          <h1 className="dashboard-title">Assign Project</h1>
          <p className="header-subtitle">Create and assign a new project to an employee</p>
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


      <div className="card card-modern assign-project-card">
        <div className="card-header-modern">
          <h3>Project Details</h3>
        </div>
        <div className="card-body-modern">
          <form onSubmit={handleSubmit}>
            <div className="form-group-modern">
              <label className="label-modern">Project Title <span className="required">*</span></label>
              <input
                type="text"
                name="title"
                className="input-modern"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter project title"
                required
              />
            </div>

            <div className="form-group-modern">
              <label className="label-modern">Description</label>
              <textarea
                name="description"
                className="input-modern textarea-modern"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the project goals and requirements..."
              />
            </div>

            <div className="form-group-modern">
              <label className="label-modern">Assign to Employee <span className="required">*</span></label>
              <select
                name="assignedTo"
                className="input-modern"
                value={formData.assignedTo}
                onChange={handleChange}
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} - {emp.email} ({emp.department || 'No Dept'})
                  </option>
                ))}
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
                />
              </div>
            </div>

            <button type="submit" className="btn btn-assign-modern btn-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Assigning...
                </>
              ) : 'Assign Project'}
            </button>


          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignProject;
