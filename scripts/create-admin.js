require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');

const { getMongoUri } = require('../src/config/mongoUri');

const MONGODB_URI = getMongoUri() || 'mongodb://localhost:27017/doi-chmt';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

async function main() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment.');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    existing.name = ADMIN_NAME || existing.name;
    existing.passwordHash = passwordHash;
    existing.role = 'admin';
    await existing.save();
    console.log('Updated existing user to admin:', ADMIN_EMAIL);
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin'
    });
    console.log('Created admin user:', ADMIN_EMAIL);
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
