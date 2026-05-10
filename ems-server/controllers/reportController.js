const WeeklyReport = require('../models/WeeklyReport');

// @desc    Create new report (Employee)
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const { projectId, projectName, weekStartDate, weekEndDate, tasksCompleted, tasksPlanned, challenges, reportContent } = req.body;

    const reportData = {
      employee: req.user._id,
      weekStartDate,
      weekEndDate,
      tasksCompleted,
      tasksPlanned,
      challenges,
      reportContent,
      submittedAt: new Date()
    };

    if (projectId) reportData.project = projectId;
    if (projectName) reportData.projectName = projectName;

    const report = await WeeklyReport.create(reportData);

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my reports (Employee)
// @route   GET /api/reports/my
// @access  Private
exports.getMyReports = async (req, res) => {
  try {
    const reports = await WeeklyReport.find({ employee: req.user._id })
      .populate('project', 'title progress')
      .sort({ submittedAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get all reports (Manager)
// @route   GET /api/reports/all
// @access  Private/Manager
exports.getAllReports = async (req, res) => {
  try {
    const reports = await WeeklyReport.find()
      .populate('employee', 'name email')
      .populate('project', 'title progress')
      .sort({ submittedAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get reports by employee (Manager)
// @route   GET /api/reports/employee/:id
// @access  Private/Manager
exports.getEmployeeReports = async (req, res) => {
  try {
    const reports = await WeeklyReport.find({ employee: req.params.id })
      .populate('project', 'title progress')
      .sort({ submittedAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

