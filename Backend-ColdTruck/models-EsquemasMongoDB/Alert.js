const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  type: String,
  description: String,
});

module.exports = mongoose.model('Alert', alertSchema, 'alert');