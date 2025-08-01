
const mongoose = require('mongoose');
const truckSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  plates: String,
  status: String,
  loadCapacity: Number,
  IDAdmin: Number,
  IDBrand: Number,
  IDModel: Number,
});
module.exports = mongoose.model('Truck', truckSchema, 'truck');
