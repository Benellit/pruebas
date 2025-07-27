const Truck = require('../../models-EsquemasMongoDB/Truck');

exports.obtenerTruckPorId = async (req, res) => {
  try {
    const truck = await Truck.findOne({ _id: Number(req.params.id) });
    if (!truck) return res.status(404).json({ msg: 'Camión no encontrado' });
    res.json(truck);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error de servidor' });
  }
};