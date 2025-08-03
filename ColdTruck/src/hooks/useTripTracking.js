import { useRef, useEffect, useCallback, useState } from 'react';
import * as Location from 'expo-location';

const TRACKING_URL = 'http://192.168.1.82:3000/tracking/guardar'; // Ajusta si tu IP/puerto cambia

export default function useTripTracking(tripId) {
  const [trackingActive, setTrackingActive] = useState(false);
  const [error, setError] = useState(null);
  const subscription = useRef(null);

  console.log('[useTripTracking] Hook mounted con tripId:', tripId);

  const stopTracking = useCallback(() => {
    console.log('[useTripTracking] stopTracking called');
    if (subscription.current) {
      subscription.current.remove();
      subscription.current = null;
      console.log('[useTripTracking] Watcher removido');
    }
    setTrackingActive(false);
    // Puedes dejar la alerta aquí o mostrarla en tu UI
    // Alert.alert('Tracking detenido');
  }, []);

  const startTracking = useCallback(async () => {
    setError(null);
    console.log('[useTripTracking] startTracking called');
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log('[useTripTracking] Permisos:', status);

    if (status !== 'granted') {
      setError('Permiso de ubicación denegado');
      alert('Permisos de ubicación denegados');
      return;
    }

    try {
      subscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // 10 segundos
          distanceInterval: 0,
        },
        async (loc) => {
          const payload = {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            IDTrip: tripId,
          };
          console.log('[useTripTracking] handleLocationUpdate', payload);
          try {
            console.log('[useTripTracking] Enviando', payload);
            const res = await fetch(TRACKING_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            const json = await res.json();
            console.log('[useTripTracking] Respuesta backend:', json);
          } catch (err) {
            console.log('[useTripTracking] Error en fetch:', err);
            alert('Error enviando ubicación: ' + String(err));
          }
        }
      );
      console.log('[useTripTracking] watchPositionAsync creado');
      setTrackingActive(true);
    } catch (err) {
      console.log('[useTripTracking] Error iniciando tracking', err);
      setError('Error iniciando tracking');
      alert('Error iniciando tracking: ' + String(err));
    }
  }, [tripId]);

  useEffect(() => {
    console.log('[useTripTracking] useEffect mount');
    return () => {
      console.log('[useTripTracking] Cleanup al desmontar');
      stopTracking();
    };
  }, [stopTracking]);

  return { startTracking, stopTracking, trackingActive, error };
}
