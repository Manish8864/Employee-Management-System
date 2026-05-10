const Leave = require('../models/Leave');

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private/Employee
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate,
      endDate,
      reason
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my leaves (Employee)
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all leaves (Manager) with filters
exports.getAllLeaves = async (req, res) => {
  try {
    let query = {};

    // Filter by employeeId
    if (req.query.employeeId) {
      query.employee = req.query.employeeId;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'name email department')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update leave status (Manager)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, managerRemark } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        managerResponseAt: new Date(),
        managerRemark: managerRemark || ''
      },
      { new: true }
    ).populate('employee', 'name email');
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyLeave: exports.applyLeave,
  getMyLeaves: exports.getMyLeaves,
  getAllLeaves: exports.getAllLeaves,
  updateLeaveStatus: exports.updateLeaveStatus
};

