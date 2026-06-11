const express = require('express');
const { getAdminProfile, loginAdmin } = require('../controllers/adminController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/me', requireAdminAuth, getAdminProfile);

module.exports = router;
