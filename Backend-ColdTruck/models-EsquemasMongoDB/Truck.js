const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema({
  number: { type: Number, required: true }, // ID del camión
  plates: String,
  status: String,
  loadCapacity: Number,
  IDAdmin: Number,
  IDBrand: Number,
  IDModel: Number,
});

module.exports = mongoose.model('Truck', truckSchema, 'truck');
