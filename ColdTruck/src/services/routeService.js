import { apiKey } from "../../conexion"; // Importa desde tu archivo de configuración

export const fetchRoute = async (start, end) => {
  try {
    const response = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      {
        method: 'POST',
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [
            [start.longitude, start.latitude],
            [end.longitude, end.latitude],
          ],
          instructions: true,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    return data.features[0].geometry.coordinates.map(([lng, lat]) => ({
      latitude: lat,
      longitude: lng,
    }));
  } catch (error) {
    throw new Error(`Error obteniendo ruta: ${error.message}`);
  }
};
