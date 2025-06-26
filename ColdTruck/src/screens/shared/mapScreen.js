import React, { useEffect, useRef, useState } from 'react';
import { View, Alert, TouchableOpacity, Text } from 'react-native';
import CustomMap from '../../components/MapComponents/CustomMap';
import { MapMarkers } from '../../components/MapComponents/MapMarkers';
import { RoutePolyline } from '../../components/MapComponents/RoutePolyline';
import { watchLocation, watchHeading } from '../../services/locationService';
import { fetchRoute } from '../../services/routeService';

export default function MapScreen() {
  const [markers, setMarkers] = useState([]);
  const [route, setRoute] = useState([]);
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [navigationMode, setNavigationMode] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    const setup = async () => {
      try {
        const locationSubscription = await watchLocation(setLocation);
        const headingSubscription = watchHeading(setHeading);
        return () => {
          locationSubscription.remove();
          headingSubscription.remove();
        };
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    };

    setup();
  }, []);

  const handleMapPress = ({ nativeEvent: { coordinate } }) => {
    if (markers.length < 2) setMarkers([...markers, coordinate]);
  };

  const handleCreateRoute = async () => {
    if (markers.length < 2) {
      Alert.alert('Selecciona 2 puntos');
      return;
    }
    try {
      const routeCoords = await fetchRoute(markers[0], markers[1]);
      setRoute(routeCoords);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const resetMap = () => {
    setMarkers([]);
    setRoute([]);
    setNavigationMode(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomMap ref={mapRef} onPress={handleMapPress}>
        <MapMarkers markers={markers} />
        {route.length > 0 && <RoutePolyline route={route} />}
      </CustomMap>

      <TouchableOpacity onPress={handleCreateRoute} style={{ position: 'absolute', bottom: 80, left: 20 }}>
        <Text>Crear Ruta</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={resetMap} style={{ position: 'absolute', bottom: 20, left: 20 }}>
        <Text>Resetear</Text>
      </TouchableOpacity>
    </View>
  );
}
