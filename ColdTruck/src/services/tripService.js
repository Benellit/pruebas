import { conexion } from '../../conexion';

export async function fetchTrip(id) {
  const res = await fetch(`${conexion}/trip/${Number(id)}`);
  if (!res.ok) throw new Error('No se pudo obtener el viaje');
  return res.json();
}



export async function fetchTripByDriver(idDriver) {
  const res = await fetch(`${conexion}/trip/driver/${idDriver}`);
  if (!res.ok) throw new Error('No hay viaje asignado');
  const data = await res.json();

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
  if (!res.ok) throw new Error('No se pudieron obtener los viajes');
  const data = await res.json();
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

export async function fetchDriverHistoryTrips(idDriver) {
  const res = await fetch(`${conexion}/trip?IDDriver=${idDriver}`);
  if (!res.ok) throw new Error('No se pudieron obtener los viajes');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}