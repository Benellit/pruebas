// ROUTE_FILTER Utility functions for filtering and ordering trips
const FINISHED_STATUSES = ['completed', 'canceled', 'cancelled']; // ROUTE_FILTER statuses that indicate a finished trip

export function getValidTrips(trips = []) {
  const now = new Date();
  return trips
    .filter(trip => {
      const departure = new Date(trip.scheduledDepartureDate);
      const arrival = new Date(trip.scheduledArrivalDate);
      const status = trip.status?.toLowerCase();

      if (FINISHED_STATUSES.includes(status)) return false; // ROUTE_FILTER exclude completed/canceled
      if (arrival < now) return false; // ROUTE_FILTER exclude arrivals in the past
      if (departure < now && arrival < now) return false; // ROUTE_FILTER exclude fully expired trips
      return true;
    })
    .sort((a, b) => new Date(a.scheduledDepartureDate) - new Date(b.scheduledDepartureDate));
    // ROUTE_FILTER sort by departure
}

export default getValidTrips;