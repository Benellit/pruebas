const express = require('express');
const router = express.Router();
const trackingController = require('../Connection/Controllers-LogicaComponentes/trackingController');

router.post('/guardar', trackingController.guardarTracking);

module.exports = router;
