const User = require('../models/User');
const { createUserToken, serializeUser } = require('../utils/userAuth');
const { validateEmail } = require('../utils/validation');

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail }).lean();

    if (existingUser) {
      return res.status(409).json({ message: 'An account already exists for this email.' });
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash: await User.hashPassword(password),
    });

    return res.status(201).json({
      message: 'Account created successfully.',
      token: createUserToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Customer registration failed:', error);
    return res.status(500).json({ message: 'Unable to create your account right now.' });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({
      message: 'Login successful.',
      token: createUserToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Customer login failed:', error);
    return res.status(500).json({ message: 'Unable to log in right now.' });
  }
}

function getUserProfile(req, res) {
  return res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    },
  });
}

module.exports = {
  getUserProfile,
  loginUser,
  registerUser,
};
