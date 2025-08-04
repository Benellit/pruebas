import { conexion } from '../../conexion';

export async function fetchTrip(id) {
  const res = await fetch(`${conexion}/trip/${Number(id)}`);
  const raw = await res.text();
  console.log('fetchTrip:', res.status, raw);
  if (!res.ok) throw new Error(raw || 'No se pudo obtener el viaje');
  return JSON.parse(raw);
}

export async function fetchTripByDriver(idDriver) {
  const res = await fetch(`${conexion}/trip/driver/${idDriver}`);
  const raw = await res.text();
  console.log('fetchTripByDriver:', res.status, raw);
  if (!res.ok) throw new Error(raw || 'No hay viaje asignado');
  const data = JSON.parse(raw);

  const now = new Date();
  const trips = Array.isArray(data) ? data : data ? [data] : [];
  trips.forEach(trip => {
    const arrival = new Date(trip.scheduledArrivalDate);
    if (arrival < now && trip.status !== 'Completed') {
      trip.status = 'Canceled'; // ASSIGN_VALIDATION auto-cancel expired trips
      // TODO: update backend with canceled status
    }
  });

  return Array.isArray(data) ? trips : trips[0];
}

export async function fetchTripsForDriver(idDriver) {
  const res = await fetch(`${conexion}/trip/driver/${idDriver}`);
  const raw = await res.text();
  console.log('fetchTripsForDriver:', res.status, raw);
  if (!res.ok) throw new Error(raw || 'No se pudieron obtener los viajes');
  const data = JSON.parse(raw);
  const trips = Array.isArray(data) ? data : data ? [data] : [];

  const now = new Date();
  trips.forEach(trip => {
    const arrival = new Date(trip.scheduledArrivalDate);
    if (arrival < now && trip.status !== 'Completed') {
      trip.status = 'Canceled'; // ASSIGN_VALIDATION auto-cancel expired trips
      // TODO: update backend with canceled status
    }
  });

  return trips;
}

export async function fetchTripsForTruck(idTruck) {
  const res = await fetch(`${conexion}/trip/truck/${idTruck}`);
  const raw = await res.text();
  console.log('fetchTripsForTruck:', res.status, raw);
  if (!res.ok) throw new Error(raw || 'No se pudieron obtener los datos del camión');
  const trips = JSON.parse(raw);

  // Encuentra un trip que tenga la propiedad 'truck' o usa el primer trip
  const truckData = trips.length > 0 ? (trips[0].truck || trips[0].IDTruck || {}) : null;

  // Une todas las alertas
  const alerts = trips
    .flatMap(trip =>
      (trip.alerts || []).map(alert => ({
        _id: `${trip._id}-${alert._id ?? alert.IDAlert}`,
        type: alert.alert?.type || 'Desconocido',
        description: alert.alert?.description || '',
        value: alert.temperature ?? alert.humidity ?? null,
        valueLabel: alert.temperature != null ? '°C' : alert.humidity != null ? '%' : '',
        dateTime: alert.dateTime,
        tripId: trip._id,
        truckPlates: truckData.plates || 'N/A',
      })),
    )
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

  return { truck: truckData, alerts, trips };
}


export async function fetchDriverHistoryTrips(idDriver) {
  const res = await fetch(`${conexion}/trip?IDDriver=${idDriver}`);
  const raw = await res.text();
  console.log('fetchDriverHistoryTrips:', res.status, raw);
  if (!res.ok) throw new Error(raw || 'No se pudieron obtener los viajes');
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}
