import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
  TextInput, ScrollView, ActivityIndicator, Keyboard, PanResponder
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome6 } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const EXPANDED_HEIGHT = Math.round(height * 0.91);
const COLLAPSED_HEIGHT = 122;
const UP_MARGIN = 75;
const SHEET_TOTAL_MOVEMENT = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
const SHEET_MIN = UP_MARGIN;
const SHEET_MAX = SHEET_TOTAL_MOVEMENT;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Dummy data para historial
const dummyTrips = [
  {
    id: 1,
    origin: { latitude: 32.526284, longitude: -117.035865 },
    stops: [{ latitude: 32.528, longitude: -117.030 }],
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

export default function CreateTripSheet({ onClose }) {
  const [dragging, setDragging] = useState(false);
  const [origin, setOrigin] = useState('');
  const [stops, setStops] = useState(['']);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  // Animación
  const translateY = useRef(new Animated.Value(SHEET_MAX)).current;

  useEffect(() => {
    // Animar apertura al montar
    Animated.timing(translateY, {
      toValue: SHEET_MIN,
      duration: 190,
      useNativeDriver: true,
    }).start();
    loadTripHistory();
  }, []);

  // --------- PanResponder (dragbar arriba) ---------
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gesture) => Math.abs(gesture.dy) > 6,
      onPanResponderGrant: () => {
        setDragging(true);
        translateY.setOffset(translateY._value);
        translateY.setValue(0);
      },
      onPanResponderMove: (evt, gesture) => {
        let newY = clamp(gesture.dy + (translateY._offset ?? 0), SHEET_MIN, SHEET_MAX);
        translateY.setValue(newY - (translateY._offset ?? 0));
      },
      onPanResponderRelease: (evt, gesture) => {
        translateY.flattenOffset();
        setDragging(false);
        let currY = clamp(translateY._value, SHEET_MIN, SHEET_MAX);

        if (gesture.dy > 38 || currY > SHEET_MIN + 80) closeSheet();
        else openSheet();
      },
    })
  ).current;

  const openSheet = () => {
    Animated.timing(translateY, {
      toValue: SHEET_MIN,
      duration: 160,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: SHEET_MAX,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      if (onClose) onClose();
    });
  };

  // --------- Dummy historial y reverse geocode ---------
  async function getPlaceName({ latitude, longitude }) {
    try {
      let placemarks = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (placemarks.length > 0) {
        const { name, street, city } = placemarks[0];
        let arr = [name, street, city].filter(Boolean);
        return arr.join(', ') || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      }
      return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    } catch (e) {
      return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    }
  }
  const loadTripHistory = async () => {
    setLoading(true);
    try {
      const tripsWithNames = await Promise.all(dummyTrips.map(async trip => {
        const originName = await getPlaceName(trip.origin);
        const stopNames = await Promise.all(trip.stops.map(getPlaceName));
        const destName = await getPlaceName(trip.destination);
        return {
          ...trip,
          originName,
          stopNames,
          destName
        };
      }));
      setTrips(tripsWithNames);
    } catch (err) {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

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

  // Estilo de dragbar cuando arrastras
  const dragBarAnimStyle = {
    opacity: dragging ? 0.7 : 1,
    transform: [{ scale: dragging ? 1.13 : 1 }],
    shadowOpacity: dragging ? 0.23 : 0.11,
    shadowRadius: dragging ? 9 : 7,
    elevation: dragging ? 8 : 2,
  };

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          height: EXPANDED_HEIGHT,
          bottom: 0,
          left: 0,
          right: 0,
          position: 'absolute',
          transform: [{ translateY }],
          zIndex: 999,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* DRAG BAR */}
      <View
        style={{ width: '100%', alignItems: 'center' }}
        {...panResponder.panHandlers}
      >
        <Animated.View style={[styles.dragBarClosed, dragBarAnimStyle]} />
      </View>
      {/* CONTENIDO */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 18 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Inputs Origen, Paradas, Botones */}
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
            <View style={styles.noDataContainer}>
              <MaterialIcons name="map" size={72} color="#1976D2" style={{ opacity: 0.13 }} />
              <Text style={styles.noDataText}>Aún no hay viajes recientes</Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 190 }}>
              {trips.map((trip, idx) => (
                <View key={trip.id} style={styles.tripCard}>
                  <View style={styles.tripLine}>
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
                    <MaterialIcons name="location-on" size={18} color="#1976D2" style={{ marginRight: 8 }} />
                    <Text numberOfLines={1} style={styles.tripText}>{trip.destName}</Text>
                  </View>
                  {idx < trips.length - 1 && <View style={styles.tripDivider} />}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 10,
    shadowColor: "#222", shadowOpacity: 0.10, shadowRadius: 14,
    pointerEvents: 'box-none',
  },
  dragBarClosed: {
    width: 40,
    height: 5,
    borderRadius: 7,
    backgroundColor: '#c1d3ee',
    marginTop: 11,
    marginBottom: 8,
    alignSelf: 'center',
  },
  cardSection: {
    backgroundColor: '#fff',
    marginHorizontal: 7,
    padding: 14,
    borderRadius: 18,
    shadowColor: "#1976D2",
    shadowOpacity: 0.06,
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
    marginHorizontal: 7,
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
    marginHorizontal: 7,
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
