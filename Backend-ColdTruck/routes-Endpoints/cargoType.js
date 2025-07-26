const express = require('express');
const { obtenerCargoType } = require('../Connection/Controllers-LogicaComponentes/cargoTypeController');
const router = express.Router();

router.get('/:id', obtenerCargoType);

module.exports = router;