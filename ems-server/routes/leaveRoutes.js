const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
} = require('../controllers/leaveController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/apply', auth, applyLeave);
router.get('/my', auth, getMyLeaves);
router.get('/all', auth, roleCheck('manager'), getAllLeaves);
router.put('/:id/status', auth, roleCheck('manager'), updateLeaveStatus);

module.exports = router;

