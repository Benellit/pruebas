const express = require('express');
const {
  obtenerTrip,
  obtenerTripPorDriver,
  obtenerTrips,
  obtenerTripsPorTruck,
   startTrip,
  finishTrip,
} = require('../Connection/Controllers-LogicaComponentes/tripController');

const router = express.Router();

router.get('/', obtenerTrips);                          // /trip?IDDriver=...
router.get('/driver/:idDriver', obtenerTripPorDriver);  // /trip/driver/...
router.get('/truck/:idTruck', obtenerTripsPorTruck);    // /trip/truck/...
router.get('/:id', obtenerTrip);                        // /trip/:id
router.post('/start', startTrip);                       // /trip/start
router.post('/finish', finishTrip);                     // /trip/finish

module.exports = router;
