const Tracking = require('../../models-EsquemasMongoDB/Tracking');

exports.guardarTracking = async (req, res) => {
  console.log('[POST /tracking/guardar] body:', req.body);
  try {
    const { lat, lng, IDTrip } = req.body;

    if (
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      typeof IDTrip !== 'number'
    ) {
      console.log('[POST /tracking/guardar] Datos inválidos');
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const nuevoTracking = new Tracking({
      type: 'Point',
      coordinates: [lng, lat], 
      dateTime: new Date(),
      IDTrip
    });

    await nuevoTracking.save();
    console.log('[POST /tracking/guardar] Tracking guardado:', nuevoTracking._id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[POST /tracking/guardar] Error:', err);
    res.status(500).json({ error: err.message });
  }
};
