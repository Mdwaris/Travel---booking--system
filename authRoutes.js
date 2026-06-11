const express = require('express');
const { getUserProfile, loginUser, registerUser } = require('../controllers/authController');
const { requireUserAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', requireUserAuth, getUserProfile);

module.exports = router;
