// src/components/MapComponents/CustomMap.js
import React from 'react';
import MapView from 'react-native-maps';
import { darkMapStyle, lightMapStyle } from '../../utils/mapStyles';

const CustomMap = React.forwardRef(({ theme = 'dark', children, style, ...props }, ref) => {
  const mapStyle = theme === 'dark' ? darkMapStyle : lightMapStyle;
  return (
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
  );
});

export default CustomMap;
