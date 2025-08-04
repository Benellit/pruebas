import React, { useRef, useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  BackHandler,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { fetchTripsForDriver } from '../../services/tripService';
import { fetchTruck } from '../../services/truckService';
import { fetchRute } from '../../services/ruteService';
import { fetchCargoType } from '../../services/cargoTypeService';
import { fetchUser } from '../../services/userService';
import { getValidTrips } from '../../utils/tripUtils';

const { width, height } = Dimensions.get('window');
const EXPANDED_HEIGHT = Math.round(height * 0.91);
const COLLAPSED_HEIGHT = 90;

const DOWN_OVERSHOOT = 15;
const UP_MARGIN = 160;
const SHEET_TOTAL_MOVEMENT = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
const SHEET_MIN = UP_MARGIN;
const SHEET_MAX = SHEET_TOTAL_MOVEMENT + DOWN_OVERSHOOT;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// -------- Tarjeta vertical, datos y estilo Home --------
function TripCard({ trip, isCurrent, t, theme }) {
  return (
    <View
      style={[
        cardStyles.card,
        {
          backgroundColor: theme === 'dark' ? (isCurrent ? t.card : t.searchSection) : (isCurrent ? "#fff" : "#f4f7fb"),
          borderColor: isCurrent
            ? (theme === 'dark' ? '#8ec3b9' : '#1976d2')
            : (theme === 'dark' ? '#344863' : '#ececec'),
          shadowOpacity: isCurrent ? 0.12 : 0.06,
          elevation: isCurrent ? 3 : 1,
        },
      ]}
    >
      {/* Header: Título y distancia */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <MaterialCommunityIcons name="truck" size={26} color="#1976d2" style={{ marginRight: 7 }} />
          <Text style={cardStyles.cardTitle} numberOfLines={1}>
            {trip._id} - {trip.rute?.name}
          </Text>
        </View>
        <Text style={[
          cardStyles.cardDistance,
          { backgroundColor: isCurrent ? "#e6f0fd" : "#f4f7fb", color: "#1976d2" }
        ]}>
          {trip.estimatedDistance ? `${(trip.estimatedDistance / 1000).toFixed(1)} km` : '-- km'}
        </Text>
      </View>
      {/* Body */}
      <Text style={cardStyles.cardCargo}>Tipo de carga: {trip.cargoType?.name}</Text>
      <Text style={cardStyles.cardDriver}>Asignado por: {trip.admin?.name || '--'}</Text>
      <Text style={cardStyles.cardDate}>{trip.formattedDate}</Text>
    </View>
  );
}

const formatDeparture = (dateStr) => {
  if (!dateStr) return '';
  try {
    // Ej: Sat, 2 Aug, 08:15 AM
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

export default function FloatingSearchBar({ onClose, theme = 'light', t }) {
  const [dragging, setDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const translateY = useRef(new Animated.Value(SHEET_MAX)).current;

  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadTrips() {
      if (!user?.id) {
        setTrips([]);
        setLoadingTrips(false);
        return;
      }
      try {
        setLoadingTrips(true);
        const raw = await fetchTripsForDriver(user.id);
        const valid = getValidTrips(raw);
        const enriched = await Promise.all(
          valid.map(async (trip) => {
            try {
              const [truck, rute, cargoType, admin] = await Promise.all([
                fetchTruck(trip.IDTruck),
                fetchRute(trip.IDRute),
                fetchCargoType(trip.IDCargoType),
                fetchUser(trip.IDAdmin),
              ]);
              return {
                ...trip,
                truck,
                rute,
                cargoType,
                admin,
                formattedDate: formatDeparture(trip.scheduledDepartureDate),
              };
            } catch {
              return trip;
            }
          })
        );
        if (mounted) setTrips(enriched);
      } catch {
        if (mounted) setTrips([]);
      } finally {
        if (mounted) setLoadingTrips(false);
      }
    }
    loadTrips();
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    const handleBack = () => {
      if (isOpen) {
        closeSheet();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => sub.remove();
  }, [isOpen]);

  const openSheet = () => {
    setIsOpen(true);
    Animated.timing(translateY, {
      toValue: SHEET_MIN,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    setIsOpen(false);
    Animated.timing(translateY, {
      toValue: SHEET_MAX,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      if (onClose) onClose();
    });
  };

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

        if (gesture.dy < -35) openSheet();
        else if (gesture.dy > 35) closeSheet();
        else if (Math.abs(currY - SHEET_MIN) < Math.abs(currY - SHEET_MAX)) openSheet();
        else closeSheet();
      },
    })
  ).current;

  const backdropOpacity = translateY.interpolate({
    inputRange: [SHEET_MIN, SHEET_MAX],
    outputRange: [0.36, 0],
    extrapolate: 'clamp',
  });

  const dragBarAnimStyle = {
    opacity: dragging ? 0.7 : 1,
    transform: [{ scale: dragging ? 1.15 : 1 }],
    shadowOpacity: dragging ? 0.3 : 0.13,
    shadowRadius: dragging ? 8 : 7,
    elevation: dragging ? 10 : 2,
  };

  // Gradientes para cada tema
  const gradientColors = theme === 'dark'
    ? [t.searchSection, t.card]
    : [t.searchSection, t.card];

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[styles.backdrop, { backgroundColor: t.background, opacity: backdropOpacity }]}
      />

      <Animated.View
        style={[
          styles.sheet,
          {
            height: EXPANDED_HEIGHT,
            position: 'absolute',
            transform: [{ translateY }],
            zIndex: 999,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
          },
        ]}
        pointerEvents="box-none"
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderTopLeftRadius: 25, borderTopRightRadius: 25 }]}
        />
        {/* Header/barra de búsqueda */}
        <View style={{ alignItems: 'center', width: '100%' }}>
          <View style={{ width: '100%', alignItems: 'center' }} {...panResponder.panHandlers}>
            <Animated.View style={[
              styles.dragBarClosed,
              {
                backgroundColor: theme === 'dark' ? '#344863' : '#c1d3ee',
              },
              dragBarAnimStyle
            ]} />
            <TouchableOpacity
              style={[
                styles.searchBarContainer,
                {
                  backgroundColor: t.searchBg,
                  borderColor: theme === 'dark' ? '#406099' : '#1976D2',
                  shadowColor: theme === 'dark' ? '#253860' : '#2976D2',
                }
              ]}
              activeOpacity={0.95}
              onPress={openSheet}
            >
              <View style={[styles.inputFake, { backgroundColor: t.card }]}>
                <Ionicons name="search" size={22} color={theme === 'dark' ? '#8ec3b9' : '#1976D2'} style={{ marginLeft: 2, marginRight: 8 }} />
                <Text style={[styles.searchPlaceholder, { color: t.text, opacity: 0.6 }]}>
                  Travel list and details
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* Tarjetas de viajes en columna */}
        <View style={[styles.bottomSection]}>
          {loadingTrips ? (
            <ActivityIndicator color={theme === 'dark' ? '#8ec3b9' : '#1976D2'} />
          ) : trips.length ? (
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 4 }}>
              {trips.map((trip, idx) => (
                <TripCard
                  key={trip._id || idx}
                  trip={trip}
                  isCurrent={idx === 0}
                  t={t}
                  theme={theme}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={{ color: t.text, opacity: 0.6, textAlign: 'center' }}>No hay viajes activos</Text>
          )}
        </View>
      </Animated.View>
    </>
  );
}

// --------- Estilos Home, columna vertical ----------

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 13,
    minHeight: 118,  // igual a Home
    width: '99%',
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
    borderColor: "#ececec",
    borderWidth: 1,
    justifyContent: 'center'
  },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#184081', marginLeft: 2, flex: 1 },
  cardCargo: { color: "#1976d2", fontSize: 13.2, marginTop: 4, fontWeight: 'bold' },
  cardDriver: { color: "#4e659c", fontSize: 13, marginTop: 2 },
  cardDate: { color: "#23314b", fontSize: 13.3, marginTop: 2 },
  cardDistance: {
    minWidth: 54,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 13,
    alignSelf: 'flex-end'
  },
});

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 12,
    shadowColor: "#222", shadowOpacity: 0.13, shadowRadius: 14,
    pointerEvents: 'box-none',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#283d5b",
  },
  dragBarClosed: {
    width: 40,
    height: 5,
    borderRadius: 7,
    backgroundColor: '#c1d3ee',
    marginTop: 7,
    marginBottom: 6,
    alignSelf: 'center',
  },
  searchBarContainer: {
    width: width - 10,
    height: 41,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf1fa',
    borderColor: '#1976D2',
    borderWidth: 2,
    borderRadius: 12,
    shadowColor: "#2976D2",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    marginTop: 4,
    marginBottom: 12,
    marginHorizontal: 5,
  },
  searchPlaceholder: {
    color: '#1a2e56',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 5,
    letterSpacing: 0.07,
    opacity: 0.62,
  },
  inputFake: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 37,
    paddingHorizontal: 10,
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 8,
    marginTop: 6,
  },
});
