const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateEmpId } = require('./employeeController');

// @desc    Register new user (Public - Employee only)
exports.register = async (req, res) => {
  try {
    const { name, email, password, department, phone, address } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const generatedName = name || email.split('@')[0];
    const empId = generateEmpId(generatedName, Date.now());
    const user = await User.create({ name: generatedName, email, password, role: 'employee', department, phone, address, empId });
    res.status(201).json({ message: 'Registration successful! Please login.', user: { id: user._id, empId: user.empId, name: user.name, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Add new manager (Manager only)
exports.addManager = async (req, res) => {
  try {
    const { name, email, password, department, phone, address } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const generatedName = name || email.split('@')[0];
    const user = await User.create({ name: generatedName, email, password, role: 'manager', department, phone, address });
    res.status(201).json({ message: 'Manager added successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, phone: user.phone, address: user.address } });
  } catch (error) { res.status(500).json({ message: error.message }); }
};


// @desc    Login user - accepts email OR empId
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    let query = {};
    if (identifier && identifier.includes('@')) {
      query = { email: identifier.toLowerCase() };
    } else if (identifier) {
      query = { empId: identifier.toUpperCase() };
    } else {
      return res.status(400).json({ message: 'Email or Employee ID required' });
    }
    const user = await User.findOne(query).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken({ id: user._id, role: user.role });
    res.json({ token, user: { id: user._id, empId: user.empId, name: user.name, email: user.email, role: user.role, department: user.department, phone: user.phone, address: user.address, joinDate: user.joinDate } });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get current user
exports.getMe = async (req, res) => {
  try { const user = await User.findById(req.user._id); res.json(user); } catch (error) { res.status(500).json({ message: error.message }); }
};


// @desc    Get all managers
exports.getAllManagers = async (req, res) => {
  try { const managers = await User.find({ role: 'manager' }).select('-password'); res.json(managers); } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get manager by ID
exports.getManagerById = async (req, res) => {
  try {
    const { id } = req.params;
    let manager = await User.findById(id).select('-password');
    if (!manager) {
      manager = await User.findOne({ empId: id }).select('-password');
    }
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    res.json(manager);
  } catch (error) { res.status(500).json({ message: error.message }); }
};


// @desc    Delete a manager
exports.deleteManager = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) return res.status(400).json({ message: 'You cannot delete your own account' });
    const manager = await User.findOneAndDelete({ _id: req.params.id, role: 'manager' });
    if (!manager) return res.status(404).json({ message: 'Manager not found' });
    res.json({ message: 'Manager deleted successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};


// @desc    Update own profile (bio, skills, etc.)
exports.updateProfile = async (req, res) => {
  try {
    const { bio, skills, linkedin, twitter } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (twitter !== undefined) user.twitter = twitter;
    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current password and new password required' });
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Update another manager's profile (Manager only)
exports.updateManagerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, phone, address, bio, skills, linkedin, twitter } = req.body;
    const manager = await User.findById(id);
    if (!manager) return res.status(404).json({ message: 'Manager not found' });
    if (name !== undefined) manager.name = name;
    if (department !== undefined) manager.department = department;
    if (phone !== undefined) manager.phone = phone;
    if (address !== undefined) manager.address = address;
    if (bio !== undefined) manager.bio = bio;
    if (skills !== undefined) manager.skills = skills;
    if (linkedin !== undefined) manager.linkedin = linkedin;
    if (twitter !== undefined) manager.twitter = twitter;
    await manager.save();
    res.json({ message: 'Manager profile updated successfully', user: manager });
  } catch (error) { res.status(500).json({ message: error.message }); }
};


module.exports = {
  register: exports.register,
  addManager: exports.addManager,
  login: exports.login,
  getMe: exports.getMe,
  getAllManagers: exports.getAllManagers,
  getManagerById: exports.getManagerById,
  deleteManager: exports.deleteManager,
  updateProfile: exports.updateProfile,
  changePassword: exports.changePassword,
  updateManagerProfile: exports.updateManagerProfile
};
