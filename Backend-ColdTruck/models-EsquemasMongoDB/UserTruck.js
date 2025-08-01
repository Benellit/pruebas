const mongoose = require('mongoose');

const userTruckSchema = new mongoose.Schema({
  IDDriver: { type: Number, required: true }, 
  IDTruck: { type: Number, required: true },  
  dateStart: Date,
  dateEnd: Date, 
});

module.exports = mongoose.model('UserTruck', userTruckSchema, 'user_truck');
