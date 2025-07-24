const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  number: { type: Number, required: true }, // ID del modelo
  name: String,
  IDBrand: Number,
});

module.exports = mongoose.model('Model', modelSchema, 'model');
