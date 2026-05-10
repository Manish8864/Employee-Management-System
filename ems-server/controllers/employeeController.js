const User = require('../models/User');

// Generate employee ID based on name and join date
const generateEmpId = (name, joinDate) => {
  // First 2 digits: name hash
  const nameHash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const nameCode = (nameHash % 99 + 1).toString().padStart(2, '0');
  
  // Middle 2 digits: day of join date
  const day = new Date(joinDate).getDate().toString().padStart(2, '0');
  
  // Last 2 digits: name first 2 chars
  const namePrefix = name.substring(0, 2).toUpperCase();
  
  return `EMP${nameCode}${day}${namePrefix}`;
};

module.exports = {
  generateEmpId,
  getAllEmployees: async (req, res) => {
    try {
      if (req.user.role === 'manager') {
        const employees = await User.find({ role: 'employee' }).select('-password');
        res.json(employees);
      } else {
        const employee = await User.findById(req.user._id).select('-password');
        res.json([employee]);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getMyDetails: async (req, res) => {
    try {
      const employee = await User.findById(req.user._id).select('-password');
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getEmployeeById: async (req, res) => {
    try {
      const employee = await User.findById(req.params.id).select('-password');
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateEmployee: async (req, res) => {
    try {
      const { name, email, department, phone, address, role, removeAvatar } = req.body;
      const updateObj = { name, department, phone, address };
      
      // Managers can update email and role
      if (req.user.role === 'manager') {
        updateObj.email = email;
        updateObj.role = role;
      }
      
      // Handle file upload
      if (req.file) {
        updateObj.avatar = `/uploads/avatars/${req.file.filename}`;
      } else if (req.body.avatar) {
        updateObj.avatar = req.body.avatar;
      } else if (removeAvatar === 'true') {
        updateObj.avatar = '';
      }

      const employee = await User.findByIdAndUpdate(
        req.params.id,
        updateObj,
        { new: true, runValidators: true }
      ).select('-password');

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  deleteEmployee: async (req, res) => {
    try {
      const employee = await User.findByIdAndDelete(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password required' });
      }
      
      const user = await User.findById(req.user._id).select('+password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }
      
      user.password = newPassword;
      await user.save();
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
