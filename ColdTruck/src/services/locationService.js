// src/services/locationService.js
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';

export const watchLocation = async (onLocationUpdate) => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Permiso denegado');

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: 5,
    },
    ({ coords }) => onLocationUpdate(coords)
  );
};

export const watchHeading = (onHeadingUpdate) => {
  Magnetometer.setUpdateInterval(100);
  return Magnetometer.addListener(({ x, y }) => {
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    onHeadingUpdate(angle);
  });
};
