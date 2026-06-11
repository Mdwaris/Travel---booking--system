const express = require('express');
const { confirmPayment } = require('../controllers/paymentController');
const { attachUserIfAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/confirm', attachUserIfAuthenticated, confirmPayment);

module.exports = router;
