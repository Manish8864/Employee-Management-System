const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true, default: Date.now },
  
  // Morning session (1st half)
  checkIn1: { type: Date },
  checkOut1: { type: Date },
  locationIn1: { latitude: Number, longitude: Number, address: String },
  locationOut1: { latitude: Number, longitude: Number, address: String },
  workingHours1: { type: Number, default: 0 },
  
  // Afternoon session (2nd half)
  checkIn2: { type: Date },
  checkOut2: { type: Date },
  locationIn2: { latitude: Number, longitude: Number, address: String },
  locationOut2: { latitude: Number, longitude: Number, address: String },
  workingHours2: { type: Number, default: 0 },
  
  // Total for the day
  workingHours: { type: Number, default: 0 },
  status: { type: String, enum: ['present', 'absent', 'half-day', 'pending'], default: 'pending' }
}, { timestamps: true });


attendanceSchema.index({ employee: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
