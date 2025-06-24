const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  phoneNumber: String,
  email: { type: String, unique: true },
  password: String,
  status: String,
  image: String,
  role: String,
});

module.exports = mongoose.model('Usuario', usuarioSchema);