const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = [
      { name: 'Manager Admin', email: 'manager@ems.com', password: 'manager123', role: 'manager', department: 'Management', phone: '9876543210', address: 'Head Office' }
    ];

    for (const u of users) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log('Skipped: ' + u.email + ' (exists)');
      } else {
        await User.create(u);
        console.log('Created: ' + u.email);
      }
    }

    console.log('Seed complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error: ' + error.message);
    process.exit(1);
  }
};

module.exports = seedData;
seedData();
