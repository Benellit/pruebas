const UserTruck = require('../../models-EsquemasMongoDB/UserTruck');
const Truck = require('../../models-EsquemasMongoDB/Truck');
const Brand = require('../../models-EsquemasMongoDB/Brand');
const Model = require('../../models-EsquemasMongoDB/Model');

exports.getDriverTruck = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    // asignación activa del camión para el driver
    const userTruck = await UserTruck.findOne({
      IDDriver: userId,
      dateEnd: { $in: [null, undefined] }
    });
    if (!userTruck)
      return res.status(404).json({ msg: 'No truck assigned to this driver' });

    // Busca el camión
    const truck = await Truck.findById(userTruck.IDTruck);
    if (!truck)
      return res.status(404).json({ msg: 'Truck not found' });

    // Marca y modelo
    const brand = await Brand.findById(truck.IDBrand);
    const model = await Model.findById(truck.IDModel);

    // Retorna detalles relevantes
    res.json({
      truckNumber: truck._id,
      plates: truck.plates,
      status: truck.status,
      loadCapacity: truck.loadCapacity,
      brand: brand ? brand.name : '',
      model: model ? model.name : '',
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
