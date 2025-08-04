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
    const now = new Date();
    // 1. Cancelar trips expirados antes de traer los datos
    await Trip.updateMany(
      { status: 'Scheduled', scheduledDepartureDate: { $lt: now } },
      { $set: { status: 'Canceled' } }
    );

    // 2. Luego traes los trips normalmente
    const trips = await Trip.find({ IDDriver: Number(req.params.idDriver), status: { $ne: 'Canceled' } })
      .sort({ scheduledDepartureDate: 1 });
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

// Obtener los trips de un camión específico con el detalle de cada alerta
exports.obtenerTripsPorTruck = async (req, res) => {
  try {
    const idTruck = Number(req.params.idTruck);
    const trips = await Trip.find({ IDTruck: idTruck })
      .populate({
        path: 'IDTruck',
        model: 'Truck',
        populate: [
          { path: 'IDBrand', model: 'Brand' },
          { path: 'IDModel', model: 'Model' },
          { path: 'IDAdmin', model: 'Usuario' },
        ],
      })
      .populate({ path: 'IDAdmin', model: 'Usuario' })
      .populate({ path: 'IDCargoType', model: 'CargoType' })
      .populate({
        path: 'alerts.IDAlert',
        model: 'Alert',
        select: 'type description',
      })
      .lean();

    const tripsConReferencias = trips.map((trip) => ({
      ...trip,
      truck: trip.IDTruck,
      admin: trip.IDAdmin,
      cargoType: trip.IDCargoType,
      alerts: (trip.alerts || []).map((alerta) => ({
        ...alerta,
        IDAlert: alerta.IDAlert?._id || alerta.IDAlert,
        alert: alerta.IDAlert
          ? {
              type: alerta.IDAlert.type,
              description: alerta.IDAlert.description,
            }
          : null,
      })),
    }));

    res.json(tripsConReferencias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};