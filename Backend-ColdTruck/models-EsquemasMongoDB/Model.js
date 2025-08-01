const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  number: { type: Number, required: true }, 
  name: String,
  IDBrand: Number,
});

module.exports = mongoose.model('Model', modelSchema, 'model');
