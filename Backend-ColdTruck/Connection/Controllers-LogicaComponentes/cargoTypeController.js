const CargoType = require('../../models-EsquemasMongoDB/CargoType');

exports.obtenerCargoType = async (req, res) => {
  try {
    const cargoType = await CargoType.findById(Number(req.params.id));
    if (!cargoType) return res.status(404).json({ msg: 'Cargo type not found' });
    res.json(cargoType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};