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
    let street = data.address.road || data.address.pedestrian || data.address.highway || data.display_name || '';
    let locality = data.address.suburb || data.address.village || data.address.town || data.address.city || '';
    let city = data.address.city || data.address.town || data.address.state || '';
    const parts = [];
    const add = (val) => {
      const norm = (val || '').trim();
      if (norm && !parts.some(p => p.toLowerCase() === norm.toLowerCase())) {
        parts.push(norm);
      }
    };
    add(street);
    add(locality);
    add(city);
    const [uStreet = '', uLocality = '', uCity = ''] = parts; 
    return {
            street: uStreet,
      locality: uLocality,
      city: uCity,
      display_name: data.display_name
    };
  } catch (err) {
    return { street: '', locality: '', city: '', display_name: '' };
  }
}
