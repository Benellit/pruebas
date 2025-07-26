const express = require('express');
const { obtenerTrip, obtenerTripPorDriver } = require('../Connection/Controllers-LogicaComponentes/tripController');
const router = express.Router();

router.get('/:id', obtenerTrip);
router.get('/driver/:idDriver', obtenerTripPorDriver);

module.exports = router;