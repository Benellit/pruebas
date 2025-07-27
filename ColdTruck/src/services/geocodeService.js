// src/services/geocodeService.js
export async function reverseGeocodeOSM([lng, lat]) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ColdTruckApp/1.0'
      }
    });
    if (!res.ok) throw new Error('No se pudo obtener la dirección');
    const data = await res.json();
    return {
      street: data.address.road || data.address.pedestrian || data.address.highway || data.display_name || '',
      locality: data.address.suburb || data.address.village || data.address.town || data.address.city || '',
      city: data.address.city || data.address.town || data.address.state || '',
      display_name: data.display_name
    };
  } catch (err) {
    return { street: '', locality: '', city: '', display_name: '' };
  }
}
