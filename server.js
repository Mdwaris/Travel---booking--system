const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDatabase = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = [
  FRONTEND_URL,
  ...String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  ...(isProduction ? [] : ['http://localhost:5173']),
];
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function validateEnvironment() {
  const requiredVariables = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_EMAIL'];

  if (isProduction) {
    requiredVariables.push('FRONTEND_URL');
  }

  if (!process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD_HASH) {
    requiredVariables.push('ADMIN_PASSWORD or ADMIN_PASSWORD_HASH');
  }

  const missingVariables = requiredVariables.filter((name) => {
    if (name === 'ADMIN_PASSWORD or ADMIN_PASSWORD_HASH') {
      return !process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD_HASH;
    }

    return !process.env[name];
  });

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
  }

  if (isProduction) {
    const unsafeValues = ['change_this_secret', 'your_jwt_secret_here', 'change_me_now'];
    const valuesToCheck = [process.env.JWT_SECRET, process.env.ADMIN_PASSWORD].filter(Boolean);

    if (valuesToCheck.some((value) => unsafeValues.includes(value))) {
      throw new Error('Replace placeholder JWT/admin credentials before production deployment.');
    }
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Travel Site Backend API',
  });
});

app.use('/api/destinations', destinationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

if (isProduction) {
  app.use(express.static(distDir));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    return res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error.' });
});

async function startServer() {
  validateEnvironment();
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
