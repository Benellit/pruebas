const Rute = require('../../models-EsquemasMongoDB/Rute');

exports.obtenerRute = async (req, res) => {
  try {
    const rute = await Rute.findById(Number(req.params.id));
    if (!rute) return res.status(404).json({ msg: 'Rute not found' });
    res.json(rute);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};