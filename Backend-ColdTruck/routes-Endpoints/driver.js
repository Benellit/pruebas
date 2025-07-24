const express = require('express');
const { getDriverTruck } = require('../Connection/Controllers-LogicaComponentes/driverController');
const router = express.Router();


router.get('/my-truck/:userId', getDriverTruck);

module.exports = router;
