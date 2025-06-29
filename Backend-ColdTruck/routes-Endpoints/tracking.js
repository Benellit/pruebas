const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

router.post('/guardar', trackingController.guardarTracking);

module.exports = router;
