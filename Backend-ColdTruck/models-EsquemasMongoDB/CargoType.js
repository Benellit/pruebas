const mongoose = require('mongoose');

const cargoTypeSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  name: String,
  description: String
});

module.exports = mongoose.model('CargoType', cargoTypeSchema, 'cargoType');