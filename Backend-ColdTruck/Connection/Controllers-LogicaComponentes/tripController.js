const mongoose = require('mongoose');
const Trip = require('../../models-EsquemasMongoDB/Trip');
require('../../models-EsquemasMongoDB/Alert');
const Usuario = require('../../models-EsquemasMongoDB/Usuario');
const Truck = require('../../models-EsquemasMongoDB/Truck');

let Box;
try {
  Box = require('../../models-EsquemasMongoDB/Box');
} catch (err) {
  Box = null;
}
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

// Inicia un viaje y cambia el estado de los recursos relacionados a "OnTrip"
exports.startTrip = async (req, res) => {
  const tripId = Number(req.body.tripId);
  if (isNaN(tripId)) {
    return res.status(400).json({ msg: 'Invalid trip ID' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const trip = await Trip.findById(tripId).session(session);
    if (!trip) {
      await session.abortTransaction();
      return res.status(404).json({ msg: 'Trip not found' });
    }

    const driver = await Usuario.findById(trip.IDDriver).session(session);
    const truck = await Truck.findById(trip.IDTruck).session(session);
    let box = null;
    if (Box && trip.IDBox != null) {
      box = await Box.findById(trip.IDBox).session(session);
    }

    if (!driver || !truck || (trip.IDBox != null && Box && !box)) {
      await session.abortTransaction();
      return res.status(404).json({ msg: 'Related resource not found' });
    }

    if (
      driver.status === 'OnTrip' ||
      truck.status === 'OnTrip' ||
      (box && box.status === 'OnTrip')
    ) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ msg: 'User, truck or box already on trip' });
    }

    trip.status = 'OnTrip';
    await trip.save({ session });

    driver.status = 'OnTrip';
    await driver.save({ session });

    truck.status = 'OnTrip';
    await truck.save({ session });

    if (box) {
      box.status = 'OnTrip';
      await box.save({ session });
    }

    await session.commitTransaction();
    res.json({ msg: 'Trip started successfully' });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  } finally {
    session.endSession();
  }
};

// Finaliza un viaje y revierte los estados a "Available"
exports.finishTrip = async (req, res) => {
  const tripId = Number(req.body.tripId);
  if (isNaN(tripId)) {
    return res.status(400).json({ msg: 'Invalid trip ID' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const trip = await Trip.findById(tripId).session(session);
    if (!trip) {
      await session.abortTransaction();
      return res.status(404).json({ msg: 'Trip not found' });
    }

    const driver = await Usuario.findById(trip.IDDriver).session(session);
    const truck = await Truck.findById(trip.IDTruck).session(session);
    let box = null;
    if (Box && trip.IDBox != null) {
      box = await Box.findById(trip.IDBox).session(session);
    }

    trip.status = 'Finished';
    await trip.save({ session });

    if (driver) {
      driver.status = 'Available';
      await driver.save({ session });
    }

    if (truck) {
      truck.status = 'Available';
      await truck.save({ session });
    }

    if (box) {
      box.status = 'Available';
      await box.save({ session });
    }

    await session.commitTransaction();
    res.json({ msg: 'Trip finished successfully' });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  } finally {
    session.endSession();
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