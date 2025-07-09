import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import CustomMap from '../../components/MapComponents/CustomMap';
import { MapMarkers } from '../../components/MapComponents/MapMarkers';
import { RoutePolyline } from '../../components/MapComponents/RoutePolyline';
import styles from '../shared/mapStyles';
import { conexion } from '../../../conexion';

export default function ViewRoutes() {
  const [trackingGroups, setTrackingGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        // Obtenemos todos los puntos de tracking
        const response = await fetch(`${conexion}/tracking`);
        const data = await response.json();
        // Agrupamos por IDTrip
        const grouped = {};
        data.forEach(t => {
          if (!grouped[t.IDTrip]) grouped[t.IDTrip] = [];
          grouped[t.IDTrip].push(t);
        });
        setTrackingGroups(Object.values(grouped));
      } catch (error) {
        Alert.alert('Error al obtener tracking', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <CustomMap ref={mapRef} style={styles.map}>
        {trackingGroups.map((trackList, idx) => (
          <React.Fragment key={`track-${idx}`}>
            <MapMarkers markers={trackList.map(t => ({
              latitude: t.coordinates[1],
              longitude: t.coordinates[0]
            }))} />
            <RoutePolyline route={trackList.map(t => ({
              latitude: t.coordinates[1],
              longitude: t.coordinates[0]
            }))} />
          </React.Fragment>
        ))}
      </CustomMap>
    </View>
  );
}
