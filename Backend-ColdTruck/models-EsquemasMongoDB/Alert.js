const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model('Alert', alertSchema, 'alert'); // El tercer parámetro es el nombre real de la colección en Mongo
