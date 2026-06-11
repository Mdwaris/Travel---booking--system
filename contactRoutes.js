const express = require('express');
const { createContactSubmission, listContactSubmissions } = require('../controllers/contactController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', requireAdminAuth, listContactSubmissions);
router.post('/', createContactSubmission);

module.exports = router;
