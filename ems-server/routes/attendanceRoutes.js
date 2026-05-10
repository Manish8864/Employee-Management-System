const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance
} = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/checkin', auth, checkIn);
router.post('/checkout', auth, checkOut);
router.get('/my', auth, getMyAttendance);
router.get('/all', auth, roleCheck('manager'), getAllAttendance);

module.exports = router;

