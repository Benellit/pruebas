const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  name: String,
});

module.exports = mongoose.model('Brand', brandSchema, 'brand');
