const express = require('express');
const {
  createBookingRequest,
  listBookingRequests,
  listMyBookingRequests,
  updateBookingRequest,
} = require('../controllers/bookingController');
const { attachUserIfAuthenticated, requireAdminAuth, requireUserAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', attachUserIfAuthenticated, createBookingRequest);
router.get('/my', requireUserAuth, listMyBookingRequests);
router.get('/', requireAdminAuth, listBookingRequests);
router.patch('/:id', requireAdminAuth, updateBookingRequest);

module.exports = router;
