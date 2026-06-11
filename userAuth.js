const jwt = require('jsonwebtoken');

function createUserToken(user) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is required for customer authentication.');
  }

  return jwt.sign(
    {
      role: 'user',
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    },
    secret,
    { expiresIn: '7d' }
  );
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

module.exports = {
  createUserToken,
  serializeUser,
};
