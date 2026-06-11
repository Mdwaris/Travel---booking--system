const { createAdminToken, validateAdminCredentials } = require('../utils/adminAuth');
const { validateEmail } = require('../utils/validation');

async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const isValid = await validateAdminCredentials(email, password);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const token = createAdminToken(String(email).trim().toLowerCase());

    return res.json({
      message: 'Admin login successful.',
      token,
      admin: {
        email: String(email).trim().toLowerCase(),
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Admin login failed:', error);
    return res.status(500).json({ message: error.message || 'Unable to log in right now.' });
  }
}

function getAdminProfile(req, res) {
  return res.json({
    admin: {
      email: req.admin.email,
      role: req.admin.role,
    },
  });
}

module.exports = {
  getAdminProfile,
  loginAdmin,
};
