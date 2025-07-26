const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: [Number]
}, { _id: false });

const ruteSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  name: String,
  maxTemp: Number,
  minTemp: Number,
  maxHum: Number,
  minHum: Number,
  origin: pointSchema,
  destination: pointSchema,
  IDAdmin: Number
});

module.exports = mongoose.model('Rute', ruteSchema, 'rute');