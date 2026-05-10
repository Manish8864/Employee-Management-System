const express = require('express');
const router = express.Router();
const {
  createReport,
  getMyReports,
  getAllReports,
  getEmployeeReports
} = require('../controllers/reportController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, createReport);
router.get('/my', auth, getMyReports);
router.get('/all', auth, roleCheck('manager'), getAllReports);
router.get('/employee/:id', auth, roleCheck('manager'), getEmployeeReports);

module.exports = router;

