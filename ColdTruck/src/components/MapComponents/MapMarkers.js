// src/components/MapComponents/MapMarkers.js
import React from 'react';
import { Marker } from 'react-native-maps';
import PinOrigen from '../../../assets/pinOrigen.png';
import PinDestino from '../../../assets/pinDestino.png';

export const MapMarkers = ({ markers }) => {
  if (!markers || markers.length === 0) return null;
  const start = markers[0];
  const end = markers[markers.length - 1];

  return (
    <>
      <Marker
        key="start"
        coordinate={start}
        title="Origen"
        image={PinOrigen}
      />
      {markers.length > 1 && (
        <Marker
          key="end"
          coordinate={end}
          title="Destino"
          image={PinDestino}
        />
      )}
    </>
  );
};
