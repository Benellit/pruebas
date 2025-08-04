const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
 _id: { type: Number, required: true },
  name: String,
  IDBrand: Number,
});

module.exports = mongoose.model('Model', modelSchema, 'model');
