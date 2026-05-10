const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false
  },
  projectName: {
    type: String,
    default: ''
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  tasksCompleted: {
    type: String,
    required: true
  },
  tasksPlanned: {
    type: String,
    required: true
  },
  challenges: {
    type: String,
    default: ''
  },
  reportContent: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);

