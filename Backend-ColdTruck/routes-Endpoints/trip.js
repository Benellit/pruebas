const express = require('express');
const { obtenerTrip, obtenerTripPorDriver, obtenerTrips } = require('../Connection/Controllers-LogicaComponentes/tripController');
const Trip = require('../models-EsquemasMongoDB/Trip');

const router = express.Router();

router.get('/', async (req, res) => {
  if (req.query.IDDriver) {
    const trips = await Trip.find({ IDDriver: Number(req.query.IDDriver) }).sort({
      scheduledDepartureDate: -1,
    });
    return res.json(trips);
  }
  res.status(400).json({ msg: 'Parámetro requerido' });
});

router.get('/', obtenerTrips);
router.get('/driver/:idDriver', obtenerTripPorDriver);
router.get('/:id', obtenerTrip);

module.exports = router;