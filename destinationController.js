const destinations = require('../data/destinations.json');

function listDestinations(req, res) {
  res.json(destinations);
}

function getDestinationById(req, res) {
  const destinationId = Number(req.params.id);
  const destination = destinations.find((item) => item.id === destinationId);

  if (!destination) {
    return res.status(404).json({ message: 'Destination not found.' });
  }

  return res.json(destination);
}

module.exports = {
  listDestinations,
  getDestinationById,
};
