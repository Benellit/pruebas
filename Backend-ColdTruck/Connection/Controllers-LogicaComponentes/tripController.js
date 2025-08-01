const Trip = require('../../models-EsquemasMongoDB/Trip');

// obtener un trip por su ID ()
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

// Obtener  los trips de un conductor por su IDDriver
exports.obtenerTripPorDriver = async (req, res) => {
  try {
    const trips = await Trip.find({ IDDriver: Number(req.params.idDriver), status: { $ne: 'Canceled' } }) // Excluye los trips cancelados
      .sort({ scheduledDepartureDate: 1 });                                                              // Esta por la fecha de salida programada, no por fecha de creación
    if (!trips || trips.length === 0) return res.status(404).json({ msg: 'Trip not found' });
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};


// filtro basico
exports.obtenerTrips = async (req, res) => {
  try {
    const idDriver = Number(req.query.IDDriver);
    const filter = { status: { $ne: 'Canceled' } };
    if (!isNaN(idDriver)) {
      filter.IDDriver = idDriver;
    }
    console.log('Buscando trips para IDDriver:', idDriver);
    const trips = await Trip.find(filter).sort({ scheduledDepartureDate: -1 });
    console.log('Resultados:', trips);
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
