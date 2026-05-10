const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyDetails,
  changePassword
} = require('../controllers/employeeController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('manager'), getAllEmployees);
router.get('/me', auth, getMyDetails);
router.get('/:id', auth, roleCheck('manager'), getEmployeeById);

// Change password route (must be before /:id to avoid being matched as :id)
router.put('/me/change-password', auth, changePassword);
// Handle both file upload and JSON body (for removeAvatar)
router.put('/:id', auth, (req, res, next) => {
  // Check if this is a multipart/form-data request with a file
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return upload.single('avatar')(req, res, next);
  }
  // Otherwise (JSON or urlencoded), let express.json() handle it
  next();
}, updateEmployee);
router.delete('/:id', auth, roleCheck('manager'), deleteEmployee);

module.exports = router;

