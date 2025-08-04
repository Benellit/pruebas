const mongoose = require('mongoose');

const TRUCK_STATUS = ['Available', 'OnTrip', 'Maintenance', 'Inactive'];

const truckSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  plates: String,
  status: { type: String, enum: TRUCK_STATUS, default: 'Available' },
  loadCapacity: Number,
  IDAdmin: Number,
  IDBrand: Number,
  IDModel: Number,
});

module.exports = mongoose.model('Truck', truckSchema, 'truck');
