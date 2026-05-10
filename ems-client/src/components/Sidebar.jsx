import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  const employeeLinks = [
    { to: '/employee', label: 'Dashboard', icon: '📊' },
    { to: '/employee/details', label: 'Personal Details', icon: '👤' },
    { to: '/employee/attendance', label: 'Attendance', icon: '⏰' },
    { to: '/employee/leave', label: 'Leave', icon: '📅' },
    { to: '/employee/projects', label: 'My Projects', icon: '🚀' },
    { to: '/employee/reports', label: 'Weekly Report', icon: '📈' },
  ];

  const managerLinks = [
    { to: '/manager', label: 'Dashboard', icon: '📊' },
    { to: '/manager/employees', label: 'All Employees', icon: '👥' },
    { to: '/manager/add-employee', label: 'Add Employee', icon: '➕' },
    { to: '/manager/managers', label: 'All Managers', icon: '👨‍💼' },
    { to: '/manager/attendance', label: 'Attendance', icon: '⏰' },
    { to: '/manager/leaves', label: 'Leave Management', icon: '📋' },
    { to: '/manager/reports', label: 'Reports', icon: '📊' },
    { to: '/manager/assign-project', label: 'Assign Project', icon: '📁' },
  ];

  const links = user?.role === 'manager' ? managerLinks : employeeLinks;

  return (
    <div className="sidebar-modern">
      <div className="sidebar-header-modern">
        <div className="logo-modern">EMS Portal</div>
        <div className="user-info-modern">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </div>
      </div>
      <div className="menu-section">
        <ul className="sidebar-menu-modern">
          {links.map(link => (
            <li key={link.to} className={isActive(link.to)}>
              <Link to={link.to} className="sidebar-link-modern">
                <span className="link-icon">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="logout-section">
        <li className="logout-item-modern">
          <a onClick={logout} className="sidebar-link-modern logout-link-modern">
            <span className="link-icon">🚪</span>
            <span>Logout</span>
          </a>
        </li>
      </div>

    </div>
  );
};

export default Sidebar;

