const Tracking = require('../../models-EsquemasMongoDB/Tracking');

exports.guardarTracking = async (req, res) => {
  try {
    const { lat, lng, IDTrip } = req.body;

    if (
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      typeof IDTrip !== 'number'
    ) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const nuevoTracking = new Tracking({
      type: 'Point',
      coordinates: [lng, lat], // formato GeoJSON: [longitud, latitud]
      IDTrip
    });

    await nuevoTracking.save();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
