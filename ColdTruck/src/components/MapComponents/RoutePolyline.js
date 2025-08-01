// src/components/MapComponents/RoutePolyline.js
import React from 'react';
import { Polyline } from 'react-native-maps';

export const RoutePolyline = ({ route }) => (
  <Polyline
    coordinates={route}
    strokeColor="#1240beff"
    strokeWidth={6}
    lineDashPattern={[1]}
  />
);
