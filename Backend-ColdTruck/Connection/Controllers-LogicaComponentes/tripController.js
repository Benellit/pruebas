const Trip = require('../../models-EsquemasMongoDB/Trip');
const Alert = require('../../models-EsquemasMongoDB/Alert');

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
    const trips = await Trip.find({ IDTruck: idTruck });

    const tripsConAlertas = await Promise.all(
      trips.map(async (trip) => {
        const alertas = await Promise.all(
          trip.alerts.map(async (alerta) => {
            const detalle = await Alert.findById(alerta.IDAlert).select(
              'type description'
            );
            return {
              ...alerta.toObject(),
              alert: detalle
                ? {
                    type: detalle.type,
                    description: detalle.description,
                  }
                : null,
            };
          })
        );
        return { ...trip.toObject(), alerts: alertas };
      })
    );

    res.json(tripsConAlertas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};