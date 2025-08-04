const FINISHED_STATUSES = ['canceled', 'cancelled']; // quitamos 'completed'

export function getValidTrips(trips = []) {
  const now = new Date();
  return trips
    .filter(trip => {
      const departure = new Date(trip.scheduledDepartureDate);
      const arrival = new Date(trip.scheduledArrivalDate);
      const status = trip.status?.toLowerCase();

      if (FINISHED_STATUSES.includes(status)) return false; // solo cancels fuera
      // Puedes quitar esto si quieres ver todos los viajes, aunque estén expirados:
      // if (arrival < now) return false;
      // if (departure < now && arrival < now) return false;
      return true;
    })
    .sort((a, b) => new Date(a.scheduledDepartureDate) - new Date(b.scheduledDepartureDate));
}


export default getValidTrips;