const Attendance = require('../models/Attendance');
const getSession = () => new Date().getHours() < 12 ? 1 : 2;

const getMonthRange = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return { start, end };
};

exports.checkIn = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const today = new Date(); today.setHours(0,0,0,0);
    const session = getSession();
    let attendance = await Attendance.findOne({ employee: req.user._id, date: { $gte: today } });
    
    if (session === 1 && attendance?.checkIn1) return res.status(400).json({ message: "Already checked in morning" });
    if (session === 2 && attendance?.checkIn2) return res.status(400).json({ message: "Already checked in afternoon" });

    if (attendance) {
      if (session === 1) { attendance.checkIn1 = new Date(); attendance.locationIn1 = { latitude, longitude, address }; } 
      else { attendance.checkIn2 = new Date(); attendance.locationIn2 = { latitude, longitude, address }; }
      attendance.status = "pending";
    } else {
      const checkInObj = session === 1 
        ? { checkIn1: new Date(), locationIn1: { latitude, longitude, address } }
        : { checkIn2: new Date(), locationIn2: { latitude, longitude, address } };
      attendance = await Attendance.create({ employee: req.user._id, date: new Date(), status: "pending", ...checkInObj });
    }
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.checkOut = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const today = new Date(); today.setHours(0,0,0,0);
    const session = getSession();
    const attendance = await Attendance.findOne({ employee: req.user._id, date: { $gte: today } });
    
    if (!attendance) return res.status(400).json({ message: "No check-in found" });
    if (session === 1 && !attendance.checkIn1) return res.status(400).json({ message: "Not checked in morning" });
    if (session === 2 && !attendance.checkIn2) return res.status(400).json({ message: "Not checked in afternoon" });
    if (session === 1 && attendance.checkOut1) return res.status(400).json({ message: "Already checked out morning" });
    if (session === 2 && attendance.checkOut2) return res.status(400).json({ message: "Already checked out afternoon" });

    if (session === 1) {
      attendance.checkOut1 = new Date(); attendance.locationOut1 = { latitude, longitude, address };
      attendance.workingHours1 = parseFloat(((attendance.checkOut1 - attendance.checkIn1) / (1000*60*60)).toFixed(2));
    } else {
      attendance.checkOut2 = new Date(); attendance.locationOut2 = { latitude, longitude, address };
      attendance.workingHours2 = parseFloat(((attendance.checkOut2 - attendance.checkIn2) / (1000*60*60)).toFixed(2));
    }
    
    const totalHours = (attendance.workingHours1 || 0) + (attendance.workingHours2 || 0);
    attendance.workingHours = totalHours;
    if (totalHours >= 8) attendance.status = "present";
    else if (totalHours >= 1) attendance.status = "half-day";
    else attendance.status = "absent";
    
    await attendance.save();
    res.json(attendance);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const { year, month } = req.query;
    let query = { employee: req.user._id };
    
    if (year && month) {
      const { start, end } = getMonthRange(parseInt(year), parseInt(month));
      query.date = { $gte: start, $lte: end };
    }
    
    const attendance = await Attendance.find(query).sort({ date: -1 });
    
    const stats = { present: 0, halfDay: 0, absent: 0, total: attendance.length };
    attendance.forEach(a => {
      if (a.status === "present") stats.present++;
      else if (a.status === "half-day") stats.halfDay++;
      else if (a.status === "absent") stats.absent++;
    });
    
    res.json({ records: attendance, stats });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const { year, month, employeeId, date } = req.query;
    let query = {};
    
    if (employeeId) query.employee = employeeId;
    
    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: selectedDate, $lt: nextDay };
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.date = { $gte: today, $lt: tomorrow };
    }
    
    const attendance = await Attendance.find(query).populate("employee", "name email department avatar").sort({ date: -1 });
    res.json(attendance);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = exports;
