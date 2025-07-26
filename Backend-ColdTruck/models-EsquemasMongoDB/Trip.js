const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  IDAlert: Number,
  dateTime: Date,
  temperature: Number,
  humidity: Number
}, { _id: false });

const tripSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  scheduledDepartureDate: Date,
  scheduledArrivalDate: Date,
  estimatedDistance: Number,
  status: String,
  IDDriver: Number,
  IDAdmin: Number,
  IDBox: Number,
  IDRute: Number,
  IDTruck: Number,
  IDCargoType: Number,
  alerts: [alertSchema]
});

module.exports = mongoose.model('Trip', tripSchema, 'trip');