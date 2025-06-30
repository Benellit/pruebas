const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: arr => arr.length === 2,
      message: 'Debe contener [longitud, latitud]'
    }
  },
  dateTime: {
    type: Date,
    default: Date.now
  },
  IDTrip: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Tracking', trackingSchema);
