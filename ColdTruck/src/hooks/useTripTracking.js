import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

const TRACKING_URL = 'http://192.168.1.82:3000/tracking/guardar';

export default function useTripTracking(tripId) {
  const [trackingActive, setTrackingActive] = useState(false);
  const [error, setError] = useState(null);
  const subscription = useRef(null);

  const stopTracking = useCallback(() => {
    if (subscription.current) {
      subscription.current.remove();
      subscription.current = null;
    }
    setTrackingActive(false);
  }, []);

  const startTracking = useCallback(async () => {
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permiso de ubicación denegado');
        return;
      }

      subscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 0,
        },
        async (loc) => {
          const payload = {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            IDTrip: tripId,
          };
          try {
            await fetch(TRACKING_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } catch (err) {
            console.log('Error enviando ubicación', err);
          }
        }
      );
      setTrackingActive(true);
    } catch (err) {
      console.log('Error iniciando tracking', err);
      setError('Error iniciando tracking');
    }
  }, [tripId]);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return { startTracking, stopTracking, trackingActive, error };
}
