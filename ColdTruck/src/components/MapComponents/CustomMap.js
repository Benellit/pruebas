// src/components/MapComponents/CustomMap.js
import React from 'react';
import MapView from 'react-native-maps';
import { mapStyle } from '../../utils/mapStyles';

const CustomMap = React.forwardRef(({ children, style, ...props }, ref) => (
  <MapView
    ref={ref}
    style={style}
    customMapStyle={mapStyle}
    showsUserLocation={true}
    followsUserLocation={true}
    showsCompass={true}
    showsTraffic={true}
    showsBuildings={true}
    {...props}
  >
    {children}
  </MapView>
));

export default CustomMap;
