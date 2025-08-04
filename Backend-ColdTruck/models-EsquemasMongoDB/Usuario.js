const mongoose = require('mongoose');

const USER_STATUS = ['Available', 'OnTrip', 'Inactive'];

const usuarioSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  name: String,
  lastName: String,
  secondLastName: String,
  email: { type: String, unique: true },
  password: String,
  phoneNumber: String,
  status: { type: String, enum: USER_STATUS, default: 'Available' },
  role: String,
  registrationDate: Date,
  license: String,
  profilePicture: String,
});

module.exports = mongoose.model('Usuario', usuarioSchema, 'user');