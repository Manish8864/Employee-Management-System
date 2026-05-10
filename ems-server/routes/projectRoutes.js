const express = require('express');
const router = express.Router();
const {
  createProject,
  getMyProjects,
  getAllProjects,
  updateProject,
  updateMyProject
} = require('../controllers/projectController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, roleCheck('manager'), createProject);
router.get('/my', auth, getMyProjects);
router.get('/all', auth, roleCheck('manager'), getAllProjects);
router.put('/:id', auth, roleCheck('manager'), updateProject);
router.put('/my/:id', auth, updateMyProject);

module.exports = router;

