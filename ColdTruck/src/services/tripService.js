import { conexion } from '../../conexion';

export async function fetchTrip(id) {
  const res = await fetch(`${conexion}/trip/${id}`);
  if (!res.ok) throw new Error('No se pudo obtener el viaje');
  return res.json();
}

export async function fetchTripByDriver(idDriver) {
  const res = await fetch(`${conexion}/trip/driver/${idDriver}`);
  if (!res.ok) throw new Error('No hay viaje asignado');
  return res.json();
}


export async function fetchTripsForDriver(idDriver) {
  const res = await fetch(`${conexion}/trip/driver/${idDriver}`);
  if (!res.ok) throw new Error('No se pudieron obtener los viajes');
  const data = await res.json();
  return Array.isArray(data) ? data : data ? [data] : [];
}