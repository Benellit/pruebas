import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { FontAwesome, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchTrip, fetchCargoType } from '../../services/tripService';
import { fetchUser } from '../../services/userService';
import { reverseGeocodeOSM } from '../../services/geocodeService';
import { formatShortDate } from '../../utils/dateUtils';

function formatHourAndDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours < 12 ? 'a.m.' : 'p.m.';
  const displayHour = (hours % 12) === 0 ? 12 : (hours % 12);
  const day = date.getDate();
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${displayHour}:${minutes} ${ampm}, ${day} ${months[date.getMonth()]}`;
}

function StatusBadge({ status }) {
  let color = '#1976D2', label = 'Desconocido', icon = "help-outline";
  if (status === "Completed") { color = "#2e7d32"; label = "Completado"; icon = "check-circle"; }
  if (status === "Canceled")  { color = "#c62828"; label = "Cancelado"; icon = "cancel"; }
  if (status === "Paused")    { color = "#efb018"; label = "Pausado"; icon = "pause-circle"; }
  return (
    <View style={[styles.badge, { backgroundColor: color + "22" }]}>
      <MaterialIcons name={icon} size={15} color={color} />
      <Text style={{ color, fontWeight: 'bold', marginLeft: 4, fontSize: 13 }}>{label}</Text>
    </View>
  );
}

function formatKm(dist) {
  if (!dist) return "0 km";
  return `${(dist / 1000).toFixed(1)} km`;
}

export default function TripDetailsScreen({ route }) {
  const { tripId, trip: initialTrip } = route.params || {};
  const [trip, setTrip] = useState(initialTrip || null);
  const [loading, setLoading] = useState(!initialTrip);
  const [originAddr, setOriginAddr] = useState({ street: '', locality: '', city: '' });
  const [destAddr, setDestAddr] = useState({ street: '', locality: '', city: '' });
  const [cargoType, setCargoType] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!tripId || initialTrip) return;
      setLoading(true);
      try {
        const data = await fetchTrip(tripId);
        if (mounted) setTrip(data);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [tripId]);

  useEffect(() => {
    let mounted = true;
    async function geocode() {
      if (!trip?.rute) return;
      if (trip.rute.origin?.coordinates) {
        const addr = await reverseGeocodeOSM(trip.rute.origin.coordinates);
        if (mounted) setOriginAddr(addr);
      }
      if (trip.rute.destination?.coordinates) {
        const addr = await reverseGeocodeOSM(trip.rute.destination.coordinates);
        if (mounted) setDestAddr(addr);
      }
    }
    geocode();
    return () => { mounted = false; };
  }, [trip]);

  useEffect(() => {
    let mounted = true;
    async function loadExtras() {
      if (!trip) return;
      try {
        if (trip.IDCargoType) {
          const c = await fetchCargoType(trip.IDCargoType);
          if (mounted) setCargoType(c);
        }
        if (trip.IDAdmin) {
          const a = await fetchUser(trip.IDAdmin);
          if (mounted) setAdmin(a);
        }
      } catch { }
    }
    loadExtras();
    return () => { mounted = false; };
  }, [trip]);

  if (loading || !trip) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 0, backgroundColor: "#f6f8fb" }}>
      <View style={styles.cardSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={styles.ruteName} numberOfLines={1}>{trip.rute?.name || 'Ruta'}</Text>
          <StatusBadge status={trip.status} />
        </View>

        <View style={styles.odWrapper}>
          {/* ORIGEN */}
          <View style={styles.odRow}>
            <View style={styles.iconBox}>
              <FontAwesome name="dot-circle-o" size={22} color="#1976D2" />
            </View>
            <View style={styles.odTextBox}>
              <Text style={styles.odHour}>{formatHourAndDate(trip.scheduledDepartureDate)}</Text>
              <Text style={styles.odStreet} numberOfLines={1}>{originAddr.street}</Text>
              <Text style={styles.odLocality}>{originAddr.locality}{originAddr.locality && originAddr.city ? ', ' : ''}{originAddr.city}</Text>
            </View>
          </View>
          {/* Línea */}
          <View style={styles.odLineContainer}>
            <View style={styles.odLine} />
          </View>
          {/* DESTINO */}
          <View style={styles.odRow}>
            <View style={styles.iconBox}>
              <MaterialIcons name="location-on" size={22} color="#43b45e" />
            </View>
            <View style={styles.odTextBox}>
              <Text style={styles.odHour}>{formatHourAndDate(trip.scheduledArrivalDate)}</Text>
              <Text style={styles.odStreet} numberOfLines={1}>{destAddr.street}</Text>
              <Text style={styles.odLocality}>{destAddr.locality}{destAddr.locality && destAddr.city ? ', ' : ''}{destAddr.city}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Cuadros de información debajo */}
      <View style={styles.infoTripSection}>
        <View style={styles.infoTripBlock}>
          <MaterialCommunityIcons name="check-circle" size={26} color="#2e5fc3" />
          <Text style={styles.infoTripTitle}>Status</Text>
          <Text style={styles.infoTripValue}>{trip.status}</Text>
        </View>
        <View style={styles.infoTripBlock}>
          <MaterialCommunityIcons name="map-marker-distance" size={26} color="#45d07e" />
          <Text style={styles.infoTripTitle}>Distance</Text>
          <Text style={styles.infoTripValue}>{formatKm(trip.estimatedDistance)}</Text>
        </View>
        <View style={styles.infoTripBlock}>
          <MaterialCommunityIcons name="cube-outline" size={26} color="#f2b93b" />
          <Text style={styles.infoTripTitle}>Type of load</Text>
          <Text style={styles.infoTripValue}>{cargoType?.name || ''}</Text>
        </View>
        <View style={styles.infoTripBlock}>
          <MaterialCommunityIcons name="account-tie" size={26} color="#d99157" />
          <Text style={styles.infoTripTitle}>Assigned by</Text>
          <Text style={styles.infoTripValue} numberOfLines={2}>
            {admin?.name} {admin?.lastName}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  cardSection: {
    backgroundColor: '#fff',
    marginHorizontal: 7,
    padding: 16,
    borderRadius: 18,
    shadowColor: "#1976D2",
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
    marginTop: 14,
    marginBottom: 14,
  },
  ruteName: {
    fontWeight: 'bold',
    color: '#162557',
    fontSize: 17,
    flex: 1,
    marginRight: 8,
    marginBottom: 7,
    letterSpacing: 0.05
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
  // --- Cuadros de info ---
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
  badge: {
    flexDirection: 'row', alignItems: 'center', marginLeft: 8,
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: -2
  },
});
