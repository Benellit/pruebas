const express = require('express');
const {
  obtenerTrip,
  obtenerTripPorDriver,
  obtenerTrips,
  obtenerTripsPorTruck,
} = require('../Connection/Controllers-LogicaComponentes/tripController');

const router = express.Router();

router.get('/', obtenerTrips);                          // /trip?IDDriver=...
router.get('/driver/:idDriver', obtenerTripPorDriver);  // /trip/driver/...
router.get('/truck/:idTruck', obtenerTripsPorTruck);    // /trip/truck/...
router.get('/:id', obtenerTrip);                        // /trip/:id

module.exports = router;
