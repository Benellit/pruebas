import React, { useEffect, useRef, useState } from 'react';
import { View, Alert, TouchableOpacity } from 'react-native';
import CustomMap from '../../components/MapComponents/CustomMap';
import { MaterialIcons } from '@expo/vector-icons';
import { MapMarkers } from '../../components/MapComponents/MapMarkers';
import { RoutePolyline } from '../../components/MapComponents/RoutePolyline';
import { watchLocation, watchHeading } from '../../services/locationService';
import { fetchRoute } from '../../services/routeService';
import styles from '../shared/mapStyles';
import { conexion } from '../../../conexion';

export default function AssignRoute() {
  const [markers, setMarkers] = useState([]);
  const [route, setRoute] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    let locationSubscription, headingSubscription;
    const setup = async () => {
      try {
        locationSubscription = await watchLocation(() => {});
        headingSubscription = watchHeading(() => {});
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    };
    setup();
    return () => {
      locationSubscription && locationSubscription.remove();
      headingSubscription && headingSubscription.remove();
    };
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

      // guardar los puntos en tracking:
      // Aquí debes definir el IDTrip a usar (ejemplo: Math.floor(Date.now()/1000) o asignado)
      // for (let coord of routeCoords) {
      //   await fetch(`${conexion}/tracking`, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       lat: coord.latitude,
      //       lng: coord.longitude,
      //       IDTrip: 1 // <--- IDTrip 
      //     })
      //   });
      // }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const resetMap = () => {
    setMarkers([]);
    setRoute([]);
  };

  return (
    <View style={styles.container}>
      <CustomMap ref={mapRef} onPress={handleMapPress} style={styles.map}>
        <MapMarkers markers={markers} />
        {route.length > 0 && <RoutePolyline route={route} />}
      </CustomMap>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={handleCreateRoute} style={styles.btnCreate}>
          <MaterialIcons name="add-road" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={resetMap} style={styles.btnReset}>
          <MaterialIcons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
