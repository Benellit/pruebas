import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Dummy data para historial (ejemplo, usa tus datos reales cuando los tengas)
const dummyTrips = [
  {
    id: 1,
    origin: { latitude: 32.526284, longitude: -117.035865 },
    stops: [
      { latitude: 32.528, longitude: -117.030 }
    ],
    destination: { latitude: 32.532326, longitude: -116.961647 },
    date: '2024-07-09T14:23:00Z'
  },
  {
    id: 2,
    origin: { latitude: 32.526284, longitude: -117.035865 },
    stops: [],
    destination: { latitude: 32.532326, longitude: -116.965 },
    date: '2024-07-08T10:11:00Z'
  }
];

const { width } = Dimensions.get('window');

export default function CreateTripScreen() {
  // Inputs dinámicos
  const [origin, setOrigin] = useState('');
  const [stops, setStops] = useState(['']);
  const [loading, setLoading] = useState(false);

  // Para historial: ubicaciones traducidas a nombre
  const [trips, setTrips] = useState([]);
  const [noTrips, setNoTrips] = useState(false);

  useEffect(() => {
    // Simulamos consulta, puedes reemplazar con tu fetch
    if (dummyTrips.length === 0) setNoTrips(true);
    else {
      setLoading(true);
      // Obtenemos nombres de ubicaciones para cada viaje
      Promise.all(dummyTrips.map(async trip => {
        const originName = await getPlaceName(trip.origin);
        const stopNames = await Promise.all(trip.stops.map(getPlaceName));
        const destName = await getPlaceName(trip.destination);
        return {
          ...trip,
          originName,
          stopNames,
          destName
        };
      })).then(setTrips)
        .catch(() => setNoTrips(true))
        .finally(() => setLoading(false));
    }
  }, []);

  // ----------- Reverse geocoding -----------
  async function getPlaceName({ latitude, longitude }) {
    try {
      let placemarks = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (placemarks.length > 0) {
        const { name, street, city } = placemarks[0];
        // Solo toma lo que exista
        let arr = [name, street, city].filter(Boolean);
        return arr.join(', ') || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      }
      return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    } catch (e) {
      return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    }
  }
  // -----------------------------------------

  // Añadir/quitar paradas
  const handleAddStop = () => setStops([...stops, '']);
  const handleStopChange = (val, idx) => {
    const copy = [...stops];
    copy[idx] = val;
    setStops(copy);
  };
  const handleRemoveStop = idx => {
    const copy = [...stops];
    copy.splice(idx, 1);
    setStops(copy);
  };

  // UI PRINCIPAL
  return (
    <View style={styles.container}>
      {/* Card superior: Origen, paradas, botón ruta */}
      <View style={styles.cardSection}>
        <View style={styles.inputRow}>
          <MaterialIcons name="my-location" size={22} color="#1976D2" />
          <TextInput
            style={styles.input}
            value={origin}
            onChangeText={setOrigin}
            placeholder="Ubicación actual"
            placeholderTextColor="#6c7aa2"
            editable
          />
        </View>
        {/* Paradas */}
        {stops.map((stop, idx) => (
          <View key={idx} style={styles.inputRow}>
            <MaterialIcons name="add-location-alt" size={22} color="#44b0d7" />
            <TextInput
              style={styles.input}
              value={stop}
              onChangeText={val => handleStopChange(val, idx)}
              placeholder={`Añadir una parada`}
              placeholderTextColor="#6c7aa2"
              editable
            />
            {/* Quitar parada */}
            {stops.length > 1 && (
              <TouchableOpacity onPress={() => handleRemoveStop(idx)}>
                <MaterialIcons name="remove-circle-outline" size={20} color="#d03131" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {/* Botón agregar parada */}
        <TouchableOpacity style={styles.addStopBtn} onPress={handleAddStop}>
          <MaterialIcons name="add" size={18} color="#1976D2" />
          <Text style={styles.addStopText}>Añadir otra parada</Text>
        </TouchableOpacity>
        {/* Botón de crear ruta */}
        <TouchableOpacity style={styles.routeBtn} onPress={() => alert('Funcionalidad pendiente: Crear ruta')}>
          <MaterialIcons name="alt-route" size={28} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.routeBtnText}>Ruta</Text>
        </TouchableOpacity>
      </View>

      {/* Accesos rápidos debajo */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => alert('Próximamente: Configuración del viaje')}>
          <Ionicons name="settings-outline" size={24} color="#1976D2" />
          <Text style={styles.quickActionText}>Config. del viaje</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => alert('Próximamente: Editar camión')}>
          <MaterialIcons name="edit-road" size={24} color="#1976D2" />
          <Text style={styles.quickActionText}>Editar camión</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => alert('Próximamente: Asignar usuario')}>
          <FontAwesome6 name="user-plus" size={22} color="#1976D2" />
          <Text style={styles.quickActionText}>Asignar usuario</Text>
        </TouchableOpacity>
      </View>

      {/* Historial de viajes recientes */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Viajes recientes</Text>
        <View style={styles.divider} />
        {loading ? (
          <ActivityIndicator size="small" color="#1976D2" style={{ marginTop: 30 }} />
        ) : trips.length === 0 ? (
          // Sin datos
          <View style={styles.noDataContainer}>
            <MaterialIcons name="map" size={72} color="#1976D2" style={{ opacity: 0.13 }} />
            <Text style={styles.noDataText}>Aún no hay viajes recientes</Text>
          </View>
        ) : (
          <ScrollView style={{ maxHeight: 190 }}>
            {trips.map((trip, idx) => (
              <View key={trip.id} style={styles.tripCard}>
                <View style={styles.tripLine}>
                  {/* Icono de origen */}
                  <MaterialIcons name="radio-button-checked" size={18} color="#45d07e" style={{ marginRight: 8 }} />
                  <Text numberOfLines={1} style={styles.tripText}>{trip.originName}</Text>
                </View>
                {trip.stopNames.map((s, i) => (
                  <View key={i} style={styles.tripLine}>
                    <MaterialIcons name="stop-circle" size={16} color="#f4ba45" style={{ marginLeft: 4, marginRight: 8 }} />
                    <Text numberOfLines={1} style={styles.tripText}>{s}</Text>
                  </View>
                ))}
                <View style={styles.tripLine}>
                  {/* Icono destino */}
                  <MaterialIcons name="location-on" size={18} color="#1976D2" style={{ marginRight: 8 }} />
                  <Text numberOfLines={1} style={styles.tripText}>{trip.destName}</Text>
                </View>
                {/* Línea divisoria */}
                {idx < trips.length - 1 && <View style={styles.tripDivider} />}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 16 },
  cardSection: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    padding: 14,
    borderRadius: 18,
    shadowColor: "#1976D2",
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 2,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f2f6fd',
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#17223b',
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  addStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#eaf4fb',
  },
  addStopText: {
    marginLeft: 4,
    color: '#1976D2',
    fontWeight: '500',
    fontSize: 15,
  },
  routeBtn: {
    backgroundColor: '#1976D2',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 7,
    paddingHorizontal: 24,
    marginTop: 7,
    shadowColor: "#1976D2",
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 2,
  },
  routeBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f2f6fd',
    marginHorizontal: 12,
    borderRadius: 15,
    padding: 6,
    marginBottom: 9,
    gap: 4,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    shadowColor: "#1976D2",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  quickActionText: {
    marginTop: 5,
    fontSize: 13.2,
    fontWeight: '500',
    color: '#25346e',
    textAlign: 'center',
  },
  historySection: {
    marginHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 17,
    padding: 14,
    marginTop: 5,
    flex: 1,
    minHeight: 180,
    shadowColor: "#1976D2",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#182654',
    marginBottom: 2,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#e8e9f3',
    marginVertical: 6,
    marginHorizontal: -8,
    borderRadius: 2,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    opacity: 0.8,
  },
  noDataText: {
    fontSize: 16,
    color: '#8896bb',
    marginTop: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  tripCard: {
    paddingVertical: 8,
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  tripLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    minHeight: 22,
  },
  tripText: {
    fontSize: 15,
    color: '#182654',
    flex: 1,
    flexShrink: 1,
    fontWeight: '400',
  },
  tripDivider: {
    height: 1,
    backgroundColor: '#e8e9f3',
    marginVertical: 5,
    borderRadius: 2,
    marginLeft: 22,
  }
});
