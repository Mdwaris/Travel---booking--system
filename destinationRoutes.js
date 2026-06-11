const express = require('express');
const { listDestinations, getDestinationById } = require('../controllers/destinationController');

const router = express.Router();

router.get('/', listDestinations);
router.get('/:id', getDestinationById);

module.exports = router;
