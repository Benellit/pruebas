// src/components/MapComponents/MapMarkers.js
import React from 'react';
import { Marker } from 'react-native-maps';

export const MapMarkers = ({ markers }) => (
  markers.map((marker, idx) => (
    <Marker
      key={idx}
      coordinate={marker}
      title={`Punto ${idx + 1}`}
      pinColor={idx === 0 ? '#4CAF50' : '#F44336'}
    />
  ))
);
