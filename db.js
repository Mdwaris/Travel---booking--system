const mongoose = require('mongoose');

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is required to start the backend.');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
  return true;
}

module.exports = connectDatabase;
