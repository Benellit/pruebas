
const mongoose = require('mongoose');
const truckSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  plates: String,
  status: String,
  loadCapacity: Number,
  IDAdmin: { type: Number, ref: 'Usuario' },
  IDBrand: { type: Number, ref: 'Brand' },
  IDModel: { type: Number, ref: 'Model' },
});
module.exports = mongoose.model('Truck', truckSchema, 'truck');
