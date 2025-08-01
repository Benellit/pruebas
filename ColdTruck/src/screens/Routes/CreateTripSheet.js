import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
  ScrollView, PanResponder, ActivityIndicator
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

import { fetchTripByDriver } from '../../services/tripService';
import { fetchRute } from '../../services/ruteService';
import { fetchCargoType } from '../../services/cargoTypeService';
import { fetchUser } from '../../services/userService';

import { reverseGeocodeOSM } from '../../services/geocodeService';

const { width, height } = Dimensions.get('window');
const EXPANDED_HEIGHT = Math.round(height * 0.91);
const COLLAPSED_HEIGHT = 122;
const UP_MARGIN = 75;
const SHEET_TOTAL_MOVEMENT = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
const SHEET_MIN = UP_MARGIN;
const SHEET_MAX = SHEET_TOTAL_MOVEMENT;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function formatDateHour(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
function formatKm(dist) {
  if (!dist) return "0 km";
  return `${(dist / 1000).toFixed(1)} km`;
}

export default function CreateTripSheet({ onClose, driverId, onShowRoute, onStartNavigation }) {
  const [dragging, setDragging] = useState(false);
  const translateY = useRef(new Animated.Value(SHEET_MAX)).current;

  const [trip, setTrip] = useState(null);
  const [rute, setRute] = useState(null);
  const [cargoType, setCargoType] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [originAddr, setOriginAddr] = useState({ street: '', locality: '', city: '' });
  const [destAddr, setDestAddr] = useState({ street: '', locality: '', city: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        if (gesture.dy > 120 || currY > SHEET_MIN + 120) {
          closeSheet();
        } else {
          openSheet();
        }
      },
    })
  ).current;

  useEffect(() => {
    openSheet();
  }, []);

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

  useEffect(() => {
  let isMounted = true;
  setLoading(true);
  setError("");
  setOriginAddr({ street: '', locality: '', city: '' });
  setDestAddr({ street: '', locality: '', city: '' });

  if (!driverId) {
    setError('No se encontró el ID del conductor.');
    setLoading(false);
    return;
  }

  fetchTripByDriver(driverId)
    .then(tripArr => {
      //  usa el primer viaje si es array, o el objeto si no - terminado por ahora
      const tripData = Array.isArray(tripArr) ? tripArr[0] : tripArr;
      console.log('tripData:', tripData);

      if (!isMounted) return;

      if (!tripData) {
        setError('No se encontró viaje asignado.');
        setLoading(false);
        return;
      }
     
      if (
        tripData.IDRute === undefined ||
        tripData.IDCargoType === undefined ||
        tripData.IDAdmin === undefined
      ) {
        setError('Faltan datos en el viaje asignado');
        setLoading(false);
        return;
      }
      setTrip(tripData);

      Promise.all([
        fetchRute(tripData.IDRute),
        fetchCargoType(tripData.IDCargoType),
        fetchUser(tripData.IDAdmin),
      ]).then(async ([ruteData, cargoData, adminData]) => {
        if (!isMounted) return;
        setRute(ruteData);
        setCargoType(cargoData);
        setAdmin(adminData);

        // --- reverse geocode  --- para que lo copies
        if (ruteData?.origin?.coordinates) {
          const addr = await reverseGeocodeOSM(ruteData.origin.coordinates);
          if (isMounted) setOriginAddr(addr);
        }
        if (ruteData?.destination?.coordinates) {
          const addr = await reverseGeocodeOSM(ruteData.destination.coordinates);
          if (isMounted) setDestAddr(addr);
        }

        setLoading(false);
      }).catch(err => {
        setError("Error cargando datos relacionados");
        setLoading(false);
      });
    })
    .catch(error => {
      setError("No se pudo cargar el viaje asignado");
      setLoading(false);
    });

  return () => { isMounted = false; };
}, [driverId]);


  if (loading) {
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 48 }}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={{ marginTop: 15, color: "#1976D2", fontWeight: '500' }}>Cargando viaje...</Text>
        </View>
      </Animated.View>
    );
  }
  if (error) {
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 48 }}>
          <Text style={{ color: "red", fontSize: 16 }}>{error}</Text>
        </View>
      </Animated.View>
    );
  }

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
      <View style={{ width: '100%', alignItems: 'center' }} {...panResponder.panHandlers}>
        <Animated.View style={[styles.dragBarClosed, {
          opacity: dragging ? 0.7 : 1,
          transform: [{ scale: dragging ? 1.13 : 1 }],
          shadowOpacity: dragging ? 0.23 : 0.11,
          shadowRadius: dragging ? 9 : 7,
          elevation: dragging ? 8 : 2,
        }]} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 18 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardSection}>
          <Text style={styles.titleAssigned}>Datos del viaje asignado</Text>
          <View style={styles.odWrapper}>
            {/* ORIGEN */}
            <View style={styles.odRow}>
              <View style={styles.iconBox}>
                <FontAwesome name="dot-circle-o" size={22} color="#1976D2" />
              </View>
              <View style={styles.odTextBox}>
                <Text style={styles.odHour}>{formatDateHour(trip.scheduledDepartureDate)}</Text>
                <Text style={styles.odStreet} numberOfLines={1}>{originAddr.street}</Text>
                <Text style={styles.odLocality}>{originAddr.locality}, {originAddr.city}</Text>
              </View>
            </View>
            <View style={styles.odLineContainer}>
              <View style={styles.odLine} />
            </View>
            {/* DESTINO */}
            <View style={styles.odRow}>
              <View style={styles.iconBox}>
                <MaterialIcons name="location-on" size={22} color="#43b45e" />
              </View>
              <View style={styles.odTextBox}>
                <Text style={styles.odHour}>{formatDateHour(trip.scheduledArrivalDate)}</Text>
                <Text style={styles.odStreet} numberOfLines={1}>{destAddr.street}</Text>
                <Text style={styles.odLocality}>{destAddr.locality}, {destAddr.city}</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <TouchableOpacity
                style={styles.viewMapBtn}
                onPress={() => {
                  if (onShowRoute && rute?.origin?.coordinates && rute?.destination?.coordinates) {
                    onShowRoute(rute.origin.coordinates, rute.destination.coordinates);
                    // close sheet so the pins are visible on the map
                   if (onClose) onClose();

                  }
                }}
              >
                <MaterialIcons name="map" size={22} color="#1976D2" style={{ marginRight: 8 }} />
                <Text style={styles.viewMapText}>View Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.routeBtn}
                onPress={() => {
                  if (onStartNavigation) onStartNavigation();
                  if (onClose) onClose();
                }}
              >
                <MaterialIcons name="flag" size={24} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.routeBtnText}>Start Trip</Text>
              </TouchableOpacity>
            </View>

        </View>
        <View style={styles.infoTripSection}>
          <View style={styles.infoTripBlock}>
            <MaterialCommunityIcons name="check-circle" size={26} color="#2e5fc3" />
            <Text style={styles.infoTripTitle}>Estado</Text>
            <Text style={styles.infoTripValue}>{trip.status}</Text>
          </View>
          <View style={styles.infoTripBlock}>
            <MaterialCommunityIcons name="map-marker-distance" size={26} color="#45d07e" />
            <Text style={styles.infoTripTitle}>Distancia</Text>
            <Text style={styles.infoTripValue}>{formatKm(trip.estimatedDistance)}</Text>
          </View>
          <View style={styles.infoTripBlock}>
            <MaterialCommunityIcons name="cube-outline" size={26} color="#f2b93b" />
            <Text style={styles.infoTripTitle}>Tipo de carga</Text>
            <Text style={styles.infoTripValue}>{cargoType?.name}</Text>
          </View>
          <View style={styles.infoTripBlock}>
            <MaterialCommunityIcons name="account-tie" size={26} color="#d99157" />
            <Text style={styles.infoTripTitle}>Asignado por</Text>
            <Text style={styles.infoTripValue} numberOfLines={2}>
              {admin?.name} {admin?.lastName}
            </Text>
          </View>
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
    padding: 16,
    borderRadius: 18,
    shadowColor: "#1976D2",
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
    marginBottom: 14,
  },
  titleAssigned: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#162557',
    marginBottom: 24,
    letterSpacing: 0.1,
  },
  odWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 8,
    marginLeft: 3,
    minHeight: 112,
    justifyContent: 'center',
  },
  odRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    minHeight: 54,
    maxWidth: '95%',
  },
  iconBox: {
    width: 36,
    alignItems: 'center',
    marginRight: 4,
  },
  odTextBox: {
    flex: 1,
    flexDirection: 'column',
  },
  odHour: {
    fontSize: 14.3,
    fontWeight: '600',
    color: '#5871c6',
    marginBottom: 0,
    marginTop: 2,
  },
  odStreet: {
    fontWeight: 'bold',
    color: '#222b45',
    fontSize: 17,
    marginBottom: 1,
  },
  odLocality: {
    fontSize: 14.1,
    color: '#8e99af',
    fontWeight: '400',
  },
  odLineContainer: {
    alignItems: 'center',
    width: 32,
    marginVertical: -4,
  },
  odLine: {
    width: 2.5,
    backgroundColor: '#dee6f3',
    height: 29,
    alignSelf: 'center',
    borderRadius: 3,
  },
  routeBtn: {
    backgroundColor: '#1976D2',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 7,
    paddingHorizontal: 24,
    marginTop: 25,
    shadowColor: "#1976D2",
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 2,
  },
  routeBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
    letterSpacing: 0.1,
  },
  viewMapBtn: {
    borderColor: '#1976D2',
    borderWidth: 2,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 7,
    paddingHorizontal: 20,
    marginTop: 12,
    shadowColor: '#1976D2',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 1,
    backgroundColor: "#fff", 
  },
  viewMapText: {
    color: '#1976D2',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.1,
  },
  infoTripSection: {
  flexDirection: 'row',
  flexWrap: 'wrap',          
  justifyContent: 'space-between',
  backgroundColor: '#f2f6fd',
  marginHorizontal: 7,
  borderRadius: 14,
  padding: 10,
  marginBottom: 15,
  marginTop: 10,
  gap: 0,                   
},
infoTripBlock: {
  width: '48%',             
  alignItems: 'center',
  paddingVertical: 12,
  borderRadius: 11,
  backgroundColor: '#fff',
  marginBottom: 12,
  // marginHorizontal: 4,     
  shadowColor: "#1976D2",
  shadowOpacity: 0.04,
  shadowRadius: 5,
  elevation: 1,
  minWidth: 90,
  maxWidth: '49%',
  marginTop: 10,
},

  infoTripTitle: {
    marginTop: 5,
    fontSize: 13.5,
    fontWeight: '500',
    color: '#25346e',
    textAlign: 'center',
    marginBottom: 2,
  },
  infoTripValue: {
    fontWeight: '700',
    color: '#17223b',
    fontSize: 14.6,
    textAlign: 'center',
    marginBottom: 2,
  },
});
