const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

console.log(
  'MONGO_URI:',
  process.env.MONGO_URI
    ? '✅ Loaded (' + process.env.MONGO_URI.substring(0, 50) + '...)'
    : '❌ Missing'
);

(async () => {
  try {
    await connectDB();

    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use('/uploads', express.static('uploads'));

    

    // Root route (health check)
    app.get('/', (req, res) => {
      res.status(200).json({ message: 'API running' });
    });

    // Routes
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/employees', require('./routes/employeeRoutes'));
    app.use('/api/attendance', require('./routes/attendanceRoutes'));
    app.use('/api/leaves', require('./routes/leaveRoutes'));
    app.use('/api/projects', require('./routes/projectRoutes'));
    app.use('/api/reports', require('./routes/reportRoutes')); // ✅ fixed here
    app.use('/api/notifications', require('./routes/notificationRoutes'));

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Server failed to start:', error.message);
  }
})();