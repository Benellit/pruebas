const Trip = require('../../models-EsquemasMongoDB/Trip');

exports.obtenerTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(Number(req.params.id));
    if (!trip) return res.status(404).json({ msg: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.obtenerTripPorDriver = async (req, res) => {
  try {
    const trip = await Trip.findOne({ IDDriver: Number(req.params.idDriver) })
      .sort({ scheduledDepartureDate: -1 });
    if (!trip) return res.status(404).json({ msg: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};