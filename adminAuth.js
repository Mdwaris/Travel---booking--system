const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
  };
}

async function validateAdminCredentials(email, password) {
  const credentials = getAdminCredentials();

  if (!credentials.email || (!credentials.password && !credentials.passwordHash)) {
    throw new Error('Admin credentials are not configured.');
  }

  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (normalizedEmail !== credentials.email.trim().toLowerCase()) {
    return false;
  }

  if (credentials.passwordHash) {
    return bcrypt.compare(password, credentials.passwordHash);
  }

  return password === credentials.password;
}

function createAdminToken(email) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is required for admin authentication.');
  }

  return jwt.sign(
    {
      role: 'admin',
      email,
    },
    secret,
    { expiresIn: '12h' }
  );
}

module.exports = {
  createAdminToken,
  validateAdminCredentials,
};
