import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ present: 0, halfDay: 0, absent: 0, total: 0 });
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [locationType, setLocationType] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const mapRef = useRef(null);
  const historyMapRef = useRef(null);

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&zoom=18&addressdetails=1'
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


  useEffect(() => { fetchAttendance(); }, [month, year]);
  useEffect(() => {
    if (currentLocation && !mapLoaded && window.L) {
      const { latitude, longitude } = currentLocation;
      setTimeout(() => {
        if (mapRef.current && !mapRef.current._leaflet_id) {
          const map = window.L.map(mapRef.current).setView([latitude, longitude], 15);
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '� OpenStreetMap'
          }).addTo(map);
          window.L.marker([latitude, longitude]).addTo(map)
            .bindPopup('Your Location').openPopup();
        }
      }, 100);
      setMapLoaded(true);
    }
  }, [currentLocation, mapLoaded]);

  useEffect(() => {
    if (showMapModal && selectedLocation && window.L && historyMapRef.current) {
      const { latitude, longitude } = selectedLocation;
      if (historyMapRef.current._leaflet_id) {
        historyMapRef.current.remove();
      }
      setTimeout(() => {
        const map = window.L.map(historyMapRef.current).setView([latitude, longitude], 16);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '� OpenStreetMap'
        }).addTo(map);
        window.L.marker([latitude, longitude]).addTo(map)
          .bindPopup(locationType).openPopup();
        map.invalidateSize();
      }, 100);
    }
  }, [showMapModal, selectedLocation, locationType]);

  const fetchAttendance = async () => {
    try {
      const { data } = await api.get('/attendance/my?year=' + year + '&month=' + month);
      setAttendance(data.records || data);
      setStats(data.stats || { present: 0, halfDay: 0, absent: 0, total: 0 });
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = (data.records || data).find(a => new Date(a.date).toISOString().split('T')[0] === today);
      setTodayStatus(todayRecord || null);
    } catch (error) { console.error('Error:', error); }
  };

  const getLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      err => {
        console.error('Geolocation error:', err);
        reject(new Error(err.message || 'Failed to get location'));
      }
    );
  });

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const location = await getLocation();
      setCurrentLocation(location);
      await api.post('/attendance/checkin', { latitude: location.latitude, longitude: location.longitude });
      setMessage('Checked in successfully! Location captured.');
      fetchAttendance();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Check-in failed. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };


  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const location = await getLocation();
      await api.post('/attendance/checkout', { latitude: location.latitude, longitude: location.longitude });
      setMessage('Checked out successfully!');
      fetchAttendance();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Check-out failed. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClick = async (loc, type) => {
    setSelectedLocation(loc);
    setLocationType(type);
    setShowMapModal(true);
    setLocationAddress('Loading address...');
    const address = await getAddressFromCoords(loc.latitude, loc.longitude);
    setLocationAddress(address);
  };


  const getStatusColor = (status) => {
    const colors = {
      'present': { bg: '#dcfce7', color: '#15803d' },
      'half-day': { bg: '#fef3c7', color: '#b45309' },
      'absent': { bg: '#fee2e2', color: '#dc2626' },
      'pending': { bg: '#e0e7ff', color: '#4338ca' }
    };
    return colors[status] || colors.pending;
  };

  const getCheckInTime = () => {
    if (!todayStatus) return '-';
    if (todayStatus.checkIn1) return new Date(todayStatus.checkIn1).toLocaleTimeString();
    if (todayStatus.checkIn2) return new Date(todayStatus.checkIn2).toLocaleTimeString();
    return '-';
  };

  const getCheckOutTime = () => {
    if (!todayStatus) return '-';
    if (todayStatus.checkOut1) return new Date(todayStatus.checkOut1).toLocaleTimeString();
    if (todayStatus.checkOut2) return new Date(todayStatus.checkOut2).toLocaleTimeString();
    return '-';
  };

  return (
    <div className="page-container-modern">
      <div className="page-header-modern">
        <div className="header-left">
          <h1 className="dashboard-title">My Attendance</h1>
          <p className="header-subtitle">{new Date(0, month - 1).toLocaleString('en', { month: 'long' })} {year}</p>
        </div>
        <div className="month-nav">
          <button className="btn btn-secondary-modern btn-sm" onClick={() => { setMonth(month === 1 ? 12 : month - 1); if (month === 1) setYear(year - 1); }}>
            P
          </button>
          <button className="btn btn-secondary-modern btn-sm" onClick={() => { setMonth(month === 12 ? 1 : month + 1); if (month === 12) setYear(year + 1); }}>
            N
          </button>
        </div>
      </div>

      {message && (
        <div className={message.includes('success') || message.includes('Checked') ? 'alert alert-success-modern' : 'alert alert-error-modern'}>
          <span className="alert-icon">{message.includes('success') || message.includes('Checked') ? 'OK' : 'X'}</span>
          {message}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card present">
<div className="stat-value">{stats.present}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card halfday">
          <div className="stat-value">{stats.halfDay}</div>
          <div className="stat-label">Half Day</div>
        </div>
        <div className="stat-card absent">
          <div className="stat-value">{stats.absent}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Days</div>
        </div>
      </div>

      <div className="card card-modern today-card">
        <div className="card-header-modern">
          <h3> Today's Status</h3>
        </div>
        <div className="card-body-modern">
          {todayStatus ? (
            <div className="today-status">
              <div className="status-row">
                <span className="status-label">Status:</span>
                <span className="status-badge-lg" style={{ backgroundColor: getStatusColor(todayStatus.status).bg, color: getStatusColor(todayStatus.status).color }}>
                  {todayStatus.status}
                </span>
              </div>
              <div className="status-row">
                <span className="status-label">Check In:</span>
                <span className="status-value">{getCheckInTime()}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Check Out:</span>
                <span className="status-value">{getCheckOutTime()}</span>
              </div>
              {todayStatus.workingHours > 0 && (
                <div className="status-row">
                  <span className="status-label">Hours:</span>
                  <span className="status-value">{todayStatus.workingHours.toFixed(2)} hrs</span>
                </div>
              )}
            </div>
          ) : (
            <div className="no-record">
              <span className="no-record-icon">[ ]</span>
              <p>No record for today.</p>
            </div>
          )}
          <div className="action-buttons">
            <button className="btn btn-success-modern btn-full" onClick={handleCheckIn} disabled={loading}>
              {loading ? 'Processing...' : '+ Check In'}
            </button>
            <button className="btn btn-danger-modern btn-full" onClick={handleCheckOut} disabled={loading}>
              {loading ? 'Processing...' : '- Check Out'}
            </button>
          </div>
        </div>
      </div>

      <div className="card card-modern">
        <div className="card-header-modern">
          <h3> {new Date(0, month - 1).toLocaleString('en', { month: 'long' })} {year} History</h3>
        </div>
        <div className="table-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
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
                  <td colSpan="7" className="empty-cell">
                    <div className="empty-state">
                      <span className="empty-icon">[ ]</span>
                      <h3>No attendance records</h3>
                      <p>Check in to start tracking</p>
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
                        <span className="date-text">
                          {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: statusColor.bg, color: statusColor.color }}>
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
                          <span className="location-link" onClick={() => handleLocationClick(locIn, 'Check-In Location')}>
                            View Location
                          </span>
                        ) : <span className="no-location">-</span>}
                      </td>
                      <td>
                        {locOut ? (
                          <span className="location-link" onClick={() => handleLocationClick(locOut, 'Check-Out Location')}>
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
              <div ref={historyMapRef} className="map-container"></div>
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

export default Attendance;
