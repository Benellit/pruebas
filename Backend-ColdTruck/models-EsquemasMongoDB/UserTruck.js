const mongoose = require('mongoose');

const userTruckSchema = new mongoose.Schema({
  IDDriver: { type: Number, required: true }, // ID de Usuario
  IDTruck: { type: Number, required: true },  // ID del Camión
  dateStart: Date,
  dateEnd: Date, // Puede ser nulo o vacío si la asignación sigue activa
});

module.exports = mongoose.model('UserTruck', userTruckSchema, 'user_truck');
