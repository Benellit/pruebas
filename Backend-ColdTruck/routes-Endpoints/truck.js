const express = require('express');
const { obtenerTruckPorId } = require('../Connection/Controllers-LogicaComponentes/truckController');
const router = express.Router();

router.get('/:id', obtenerTruckPorId);

module.exports = router;