const express = require('express');
const { obtenerRute } = require('../Connection/Controllers-LogicaComponentes/ruteController');
const router = express.Router();

router.get('/:id', obtenerRute);

module.exports = router;