import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    present: 0,
    halfDay: 0,
    absent: 0,
    pendingLeaves: 0,
    activeProjects: 0,
    totalReports: 0
  });

  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        
        const [attRes, leaveRes, projRes, repRes, managerRes] = await Promise.all([
          api.get('/attendance/all?month=' + currentMonth + '&year=' + currentYear),
          api.get('/leaves/all'),
          api.get('/projects/all'),
          api.get('/reports/all'),
          api.get('/employees/me')
        ]);

        const attData = attRes.data;
        const leaves = leaveRes.data || [];
        const projects = projRes.data || [];
        const reports = repRes.data || [];

        setStats({
          present: attData?.stats?.present || 0,
          halfDay: attData?.stats?.halfDay || 0,
          absent: attData?.stats?.absent || 0,
          pendingLeaves: leaves.filter(l => l.status === 'pending').length,
          activeProjects: projects.filter(p => p.status === 'active').length,
          totalReports: reports.length
        });

        setManager(managerRes.data);

        try {
          const notifRes = await api.get('/notifications');
          const data = notifRes.data;
          if (data && data.notifications) {
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount || 0);
          } else {
            setNotifications(data || []);
            setUnreadCount(data?.length || 0);
          }
        } catch (e) {
          console.log('Notification error');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNotificationClick = async () => {
    if (!showNotifications) {
      try {
        await api.put('/notifications/read-all');
        const notifRes = await api.get('/notifications');
        const data = notifRes.data;
        if (data && data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || 0);
        } else {
          setNotifications(data);
          setUnreadCount(0);
        }
      } catch (e) {}
    }
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showNotifications && !e.target.closest('.notification-modern')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  if (loading) return <div className="loading-modern">Loading dashboard...</div>;

  return (
    <div className="dashboard-container fade-in">
      <div className="page-header-modern">
        <div className="header-left">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {manager?.name || 'Manager'}!</p>
          </div>
        </div>
        <div className="page-header-right">
          <div className="notification-modern top-right-notif notification-left" style={{order: -1, marginRight: 'auto'}} onClick={handleNotificationClick}>
            <svg className="notif-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </div>
          <div className="employee-info-modern top-right-dept">
            <span className="role-badge-employee">{manager?.department || 'Management'}</span>
          </div>
        </div>
      </div>

      {showNotifications && (
        <div className="notification-dropdown-modern">
          <div className="dropdown-header">
            <h4>Recent Notifications</h4>
            <Link to="/manager/notifications" className="view-all-link">View All</Link>
          </div>
          {notifications.length === 0 ? (
            <div className="no-notif">No notifications</div>
          ) : (
            notifications.slice(0, 5).map(n => (
              <div key={n._id} className="notif-item">
                <div className="notif-title">{n.title}</div>
                <div className="notif-meta">
                  <span className={'notif-type ' + (n.type || 'info')}>{n.type?.toUpperCase() || 'INFO'}</span>
                  <span>{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <span>by {n.createdBy?.name || 'Unknown'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="stats-grid-modern">
        <div className="stat-card-modern stat-blue-modern">
          <div className="stat-icon">&#x1F4C8;</div>
          <div className="stat-number">{stats.present || 0}</div>
          <div className="stat-label">Attendance</div>
          <Link to="/manager/attendance" className="stat-link">View</Link>
        </div>
        <div className="stat-card-modern stat-orange-modern">
          <div className="stat-icon">&#x1F4C9;</div>
          <div className="stat-number">{stats.pendingLeaves}</div>
          <div className="stat-label">Pending Leaves</div>
          <Link to="/manager/leaves" className="stat-link">View</Link>
        </div>
        <div className="stat-card-modern stat-green-modern">
          <div className="stat-icon">&#x1F680;</div>
          <div className="stat-number">{stats.activeProjects}</div>
          <div className="stat-label">Active Projects</div>
          <Link to="/manager/assign-project" className="stat-link">View</Link>
        </div>
        <div className="stat-card-modern stat-purple-modern">
          <div className="stat-icon">&#x1F4CA;</div>
          <div className="stat-number">{stats.totalReports}</div>
          <div className="stat-label">Reports Submitted</div>
          <Link to="/manager/reports" className="stat-link">View</Link>
        </div>
      </div>

      <div className="cta-section">
        <Link to="/manager/notifications" className="cta-button-modern">
          <span className="cta-text">
            <span className="cta-title">Send Notification</span>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default ManagerDashboard;
