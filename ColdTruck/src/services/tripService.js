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

export async function fetchTripsForTruck(idTruck) {
  const res = await fetch(`${conexion}/trips/truck/${idTruck}`);
  if (!res.ok) throw new Error('No se pudieron obtener los datos del camión');
  const truck = await res.json();

  const alerts = (truck.trips || [])
    .flatMap(trip =>
      (trip.alerts || []).map(alert => ({
        _id: `${trip._id}-${alert._id ?? alert.IDAlert}`,
        type: alert.alert?.type || 'Desconocido',
        description: alert.alert?.description || '',
        value: alert.temperature ?? alert.humidity ?? null,
        valueLabel:
          alert.temperature != null ? '°C' : alert.humidity != null ? '%' : '',
        dateTime: alert.dateTime,
        tripId: trip._id,
        truckPlates: truck.plates,
      })),
    )
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

  return { truck, alerts };
}

export async function fetchDriverHistoryTrips(idDriver) {
  const res = await fetch(`${conexion}/trip?IDDriver=${idDriver}`);
  if (!res.ok) throw new Error('No se pudieron obtener los viajes');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}