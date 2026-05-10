const Project = require('../models/Project');

// @desc    Get my projects (Employee)
// @route   GET /api/projects/my
// @access  Private/Employee
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ assignedTo: req.user._id })
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects (Manager)
// @route   GET /api/projects/all
// @access  Private/Manager
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('assignedTo', 'name email')
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create project (Manager)
// @route   POST /api/projects
// @access  Private/Manager
exports.createProject = async (req, res) => {
  try {
    const { title, description, assignedTo, startDate, endDate } = req.body;

    const project = await Project.create({
      title,
      description,
      assignedTo,
      manager: req.user._id,
      startDate,
      endDate
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project (Manager)
// @route   PUT /api/projects/:id
// @access  Private/Manager
exports.updateProject = async (req, res) => {
  try {
    const { title, description, assignedTo, status, progress, startDate, endDate } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedTo, status, progress, startDate, endDate },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project (Manager)
// @route   DELETE /api/projects/:id
// @access  Private/Manager
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update my project (Employee - progress/status only)
// @route   PUT /api/projects/my/:id
// @access  Private/Employee
exports.updateMyProject = async (req, res) => {
  try {
    const { progress, status } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is assigned to project
    if (!project.assignedTo.some(id => id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized - not assigned to project' });
    }

    if (progress !== undefined) {
      project.progress = Math.max(0, Math.min(100, Number(progress)));
    }
    if (status) {
      project.status = status;
    }

    const updatedProject = await project.save().then(() => Project.findById(projectId).populate('manager', 'name email'));

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

