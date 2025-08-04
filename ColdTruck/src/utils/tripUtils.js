const ALLOWED_STATUS = ['scheduled'];

export function getValidTrips(trips = [], options = {}) {
  const { includeCompleted = false } = options;
  const now = new Date();
  return trips
    .filter(trip => {
      const departure = new Date(trip.scheduledDepartureDate);
      const status = trip.status?.toLowerCase();

      if (status === 'completed') {
        return includeCompleted;
      }
      if (!ALLOWED_STATUS.includes(status)) return false;
      if (departure < now) return false;
      return true;
    })
    .sort((a, b) => new Date(a.scheduledDepartureDate) - new Date(b.scheduledDepartureDate));
}

export default getValidTrips;