const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    IDAlert: { type: Number, ref: 'Alert' },
    dateTime: Date,
    temperature: Number,
    humidity: Number,
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  scheduledDepartureDate: Date,
  scheduledArrivalDate: Date,
  estimatedDistance: Number,
  status: String,
  IDDriver: Number,
   IDAdmin: { type: Number, ref: 'Usuario' },
  IDBox: Number,
  IDRute: Number,
  IDTruck: { type: Number, ref: 'Truck' },
  IDCargoType: { type: Number, ref: 'CargoType' },
  alerts: [alertSchema],
});

module.exports = mongoose.model('Trip', tripSchema, 'trip');