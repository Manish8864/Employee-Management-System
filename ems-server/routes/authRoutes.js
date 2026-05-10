const express = require('express');
const router = express.Router();
const { register, addManager, login, getMe, getAllManagers, getManagerById, deleteManager, changePassword, updateProfile, updateManagerProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public registration - only allows employee role
router.post('/register', register);


// Manager-only route to add new managers
router.post('/add-manager', auth, roleCheck('manager'), addManager);

router.post('/login', login);
router.get('/me', auth, getMe);

// Update own profile (for both employees and managers)
router.put('/profile', auth, updateProfile);

// Change password (for both employees and managers)
router.put('/change-password', auth, changePassword);

// Manager-only routes for managing other managers
router.get('/managers', auth, roleCheck('manager'), getAllManagers);
router.get('/managers/:id', auth, roleCheck('manager'), getManagerById);
router.put('/managers/:id', auth, roleCheck('manager'), updateManagerProfile);
router.delete('/managers/:id', auth, roleCheck('manager'), deleteManager);

module.exports = router;
