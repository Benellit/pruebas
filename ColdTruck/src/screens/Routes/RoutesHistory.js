import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import styles from '../shared/mapStyles';
import { conexion } from '../../../conexion';
import { fetchTrip } from '../../services/tripService';
import { AuthContext } from '../../context/AuthContext';
export default function RoutesHistory({ route }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const driverId = route?.params?.driverId || user?.id;

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const response = await fetch(`${conexion}/tracking`);
        const data = await response.json();
        const trips = {};
        data.forEach(t => {
          if (!trips[t.IDTrip]) trips[t.IDTrip] = [];
          trips[t.IDTrip].push(t);
        });
        const entries = await Promise.all(
          Object.entries(trips).map(async ([IDTrip, points]) => {
            try {
              const tripInfo = await fetchTrip(IDTrip);
              if (tripInfo && String(tripInfo.IDDriver) === String(driverId)) {
                return [IDTrip, points];
              }
            } catch (e) {
              // ignore fetch errors
            }
            return null;
          })
        );
        setHistory(entries.filter(Boolean));
      } catch (error) {
        Alert.alert('Error al obtener historial', error.message);
      } finally {
        setLoading(false);
      }
    };
    if (driverId) {
      fetchTracking();
    } else {
      setLoading(false);
    }
  }, [driverId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Historial de Rutas</Text>
      <FlatList
        data={history}
        keyExtractor={([IDTrip]) => IDTrip.toString()}
        renderItem={({ item: [IDTrip, points] }) => (
          <TouchableOpacity style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: 'bold' }}>Viaje #{IDTrip}</Text>
            <Text>Total de puntos: {points.length}</Text>
            {/* Puedes agregar más detalles aquí */}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}