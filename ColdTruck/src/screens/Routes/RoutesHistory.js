import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import styles from '../shared/mapStyles';
import { conexion } from '../../../conexion';

export default function RoutesHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const response = await fetch(`${conexion}/tracking`);
        const data = await response.json();
        // Agrupar por IDTrip
        const trips = {};
        data.forEach(t => {
          if (!trips[t.IDTrip]) trips[t.IDTrip] = [];
          trips[t.IDTrip].push(t);
        });
        setHistory(Object.entries(trips)); // [ [IDTrip, [trackingPoints]] ]
      } catch (error) {
        Alert.alert('Error al obtener historial', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, []);

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
