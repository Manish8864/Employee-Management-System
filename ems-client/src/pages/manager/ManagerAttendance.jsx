import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

const ManagerAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showMonthView, setShowMonthView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationType, setLocationType] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const mapRef = useRef(null);

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        return data.display_name;
      }
      return '';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return '';
    }
  };

  useEffect(() => { fetchAttendance(); fetchEmployees(); }, [month, year, filterEmployee, filterDate]);

  useEffect(() => {
    if (showMapModal && selectedLocation && window.L && mapRef.current) {
      const { latitude, longitude } = selectedLocation;
      if (mapRef.current._leaflet_id) {
        mapRef.current.remove();
      }
      setTimeout(() => {
        const map = window.L.map(mapRef.current).setView([latitude, longitude], 16);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);
        window.L.marker([latitude, longitude]).addTo(map)
          .bindPopup(locationType).openPopup();
        map.invalidateSize();
      }, 100);
    }
  }, [showMapModal, selectedLocation, locationType]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let url = `/attendance/all?year=${year}&month=${month}`;
      if (filterEmployee) url += `&employeeId=${filterEmployee}`;
      if (filterDate) url += `&date=${filterDate}`;
      const { data } = await api.get(url);
      setAttendance(data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    try { const { data } = await api.get('/employees'); setEmployees(data); }
    catch (error) { console.error('Error:', error); }
  };

  const getStatusColor = (status) => {
    const colors = {
      'present': { bg: '#dcfce7', color: '#15803d', icon: 'P' },
      'half-day': { bg: '#fef3c7', color: '#b45309', icon: 'H' },
      'absent': { bg: '#fee2e2', color: '#dc2626', icon: 'A' }
    };
    return colors[status] || colors.absent;
  };

  const getAvatarUrl = (avatar, name) => {
    if (avatar) {
      return avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'E')}&size=64&background=4F46E5&color=fff`;
  };

  const handleLocationClick = async (loc, type) => {
    setSelectedLocation(loc);
    setLocationType(type);
    setShowMapModal(true);
    setLocationAddress('Loading address...');
    const address = await getAddressFromCoords(loc.latitude, loc.longitude);
    setLocationAddress(address);
  };

  const clearDateFilter = () => {
    setFilterDate('');
    setShowMonthView(false);
  };

  if (loading) {
    return (
      <div className="page-container-modern">
        <div className="loading-container">
          <div className="spinner-modern"></div>
          <p>Loading attendance records...</p>
        </div>
      </div>
    );
  }

  const formattedFilterDate = filterDate ? new Date(filterDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : 'All Dates';

  return (
    <div className="page-container-modern">
      <div className="page-header-modern">
        <div className="header-left">
          <h1 className="dashboard-title">Employee Attendance</h1>
          <p className="header-subtitle">
            {filterDate ? formattedFilterDate : `${attendance.length} records for ${new Date(0, month - 1).toLocaleString('en', { month: 'long' })} ${year}`}
          </p>
        </div>
      </div>

      <div className="card card-modern filters-card">
        <div className="filters-grid-4">
          <div className="form-group-modern">
            <label className="label-modern">Employee</label>
            <select className="input-modern" value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)}>
              <option value="">All Employees</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
            </select>
          </div>
          <div className="form-group-modern">
            <label className="label-modern">Date</label>
            <input
              type="date"
              className="input-modern"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="form-group-modern">
            <label className="label-modern">Month</label>
            <select className="input-modern" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
              {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>)}
            </select>
          </div>
          <div className="form-group-modern">
            <label className="label-modern">Year</label>
            <select className="input-modern" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
              {[new Date().getFullYear() - 2, new Date().getFullYear() - 1, new Date().getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        {filterDate && (
          <div className="filter-actions">
            <button className="btn btn-secondary-modern btn-sm" onClick={clearDateFilter}>
              Clear Date Filter
            </button>
          </div>
        )}
      </div>

      <div className="card card-modern">
        <div className="table-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th style={{ minWidth: '180px' }}>Employee</th>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Check-In Location</th>
                <th>Check-Out Location</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    <div className="empty-state">
                      <span className="empty-icon">[ ]</span>
                      <h3>No records found</h3>
                      <p>Try changing the filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                attendance.map(record => {
                  const locIn = record.locationIn1?.latitude ? record.locationIn1 : record.locationIn2?.latitude ? record.locationIn2 : null;
                  const locOut = record.locationOut1?.latitude ? record.locationOut1 : record.locationOut2?.latitude ? record.locationOut2 : null;
                  const statusColor = getStatusColor(record.status);
                  return (
                    <tr key={record._id} className="table-row-modern">
                      <td>
                        <div className="employee-cell">
                          <img src={getAvatarUrl(record.employee?.avatar, record.employee?.name)} alt={record.employee?.name} className="table-avatar-small" />
                          <span className="employee-name">{record.employee?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="date-text">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: statusColor.bg, color: statusColor.color }}>
                          <span className="status-icon">{statusColor.icon}</span>
                          {record.status}
                        </span>
                      </td>
                      <td>
                        <span className="time-text">
                          {record.checkIn1 ? new Date(record.checkIn1).toLocaleTimeString() : record.checkIn2 ? new Date(record.checkIn2).toLocaleTimeString() : '-'}
                        </span>
                      </td>
                      <td>
                        <span className="time-text">
                          {record.checkOut1 ? new Date(record.checkOut1).toLocaleTimeString() : record.checkOut2 ? new Date(record.checkOut2).toLocaleTimeString() : '-'}
                        </span>
                      </td>
                      <td>
                        {locIn ? (
                          <span
                            className="location-link"
                            onClick={() => handleLocationClick(locIn, 'Check-In Location')}
                          >
                            View Location
                          </span>
                        ) : <span className="no-location">-</span>}
                      </td>
                      <td>
                        {locOut ? (
                          <span
                            className="location-link"
                            onClick={() => handleLocationClick(locOut, 'Check-Out Location')}
                          >
                            View Location
                          </span>
                        ) : <span className="no-location">-</span>}
                      </td>
                      <td>
                        <span className="hours-badge">
                          {record.workingHours?.toFixed(2) || '0.00'}h
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

      {showMapModal && selectedLocation && (
        <div className="modal-overlay" onClick={() => setShowMapModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{locationType}</h2>
              <button className="modal-close" onClick={() => setShowMapModal(false)}>X</button>
            </div>
            <div className="modal-body">
              <div ref={mapRef} className="map-container"></div>
              {locationAddress && (
                <div className="address-display">
                  <label className="detail-label">Address</label>
                  <p className="detail-value">{locationAddress}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerAttendance;
