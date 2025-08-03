// src/screens/Routes/DriverHistoryScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchDriverHistoryTrips } from '../../services/tripService';
import { reverseGeocodeOSM } from '../../services/geocodeService';
import { formatShortDate } from '../../utils/dateUtils'; // Ajusta si tu formato incluye hora, si no te paso uno
import dayjs from 'dayjs';

const SECTION_TITLES = {
  today: 'Hoy',
  lastWeek: 'Semana pasada',
  earlier: 'Pasados'
};

function groupTripsByDate(trips) {
  const today = dayjs().startOf('day');
  const lastWeek = today.subtract(7, 'days');
  const groups = { today: [], lastWeek: [], earlier: [] };

  trips.forEach(trip => {
    const tripDate = dayjs(trip.scheduledDepartureDate).startOf('day');
    if (tripDate.isSame(today, 'day')) {
      groups.today.push(trip);
    } else if (tripDate.isAfter(lastWeek) && tripDate.isBefore(today)) {
      groups.lastWeek.push(trip);
    } else {
      groups.earlier.push(trip);
    }
  });

  return groups;
}

// Para mostrar "08:23 a.m., 20 jul"
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

export default function DriverHistoryScreen({ navigation, route }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState({ today: false, lastWeek: false, earlier: false });
  const driverId = route.params?.driverId;

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchDriverHistoryTrips(driverId);
        const valid = (data || []).filter(t =>
          ["Completed", "Canceled", "Paused"].includes(t.status)
        );
        // Obtén direcciones legibles para origen y destino
        const withAddresses = await Promise.all(
          valid.map(async t => {
            const [orig, dest] = await Promise.all([
              t.rute?.origin?.coordinates ? reverseGeocodeOSM(t.rute.origin.coordinates) : { street: '', locality: '', city: '' },
              t.rute?.destination?.coordinates ? reverseGeocodeOSM(t.rute.destination.coordinates) : { street: '', locality: '', city: '' }
            ]);
            return {
              ...t,
              rute: {
                ...t.rute,
                originAddr: orig,
                destinationAddr: dest,
              },
            };
          })
        );
        if (!mounted) return;
        setTrips(withAddresses);
      } catch (e) {
        // Error handling opcional
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, [driverId]);

  // Agrupamos viajes por fecha
  const grouped = groupTripsByDate(trips);

  function toggleCollapse(section) {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f6f8fb" }}>
      {Object.entries(grouped).map(([section, items]) => (
        <View key={section}>
          <TouchableOpacity onPress={() => toggleCollapse(section)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{SECTION_TITLES[section]}</Text>
            <MaterialIcons name={collapsed[section] ? "expand-more" : "expand-less"} size={22} color="#222" />
          </TouchableOpacity>
          {!collapsed[section] && items.length > 0 && items.map(trip => (
            <HistoryCard
              key={trip._id}
              trip={trip}
              onPress={() =>
                navigation.navigate('TripDetailsScreen', { tripId: trip._id, trip })
              }
            />
          ))}
          {!collapsed[section] && items.length === 0 && (
            <Text style={styles.emptyMsg}>Sin viajes en esta sección.</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function HistoryCard({ trip, onPress }) {
  // Datos legibles de origen y destino
  const originAddr = trip.rute?.originAddr || { street: '', locality: '', city: '' };
  const destAddr = trip.rute?.destinationAddr || { street: '', locality: '', city: '' };

  return (
    <TouchableOpacity style={styles.cardSection} onPress={onPress} activeOpacity={0.88}>
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
            <Text style={styles.odLocality}>{originAddr.locality}{originAddr.locality && destAddr.city ? ', ' : ''}{originAddr.city}</Text>
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
            <Text style={styles.odHour}>{formatHourAndDate(trip.scheduledArrivalDate)}</Text>
            <Text style={styles.odStreet} numberOfLines={1}>{destAddr.street}</Text>
            <Text style={styles.odLocality}>{destAddr.locality}{destAddr.locality && destAddr.city ? ', ' : ''}{destAddr.city}</Text>
          </View>
        </View>
      </View>
      {/* Abajo: placas y ID camión */}
      <View style={styles.bottomGray}>
        <MaterialIcons name="local-shipping" size={18} color="#888" />
        <Text style={styles.platesText}>
          {trip.truck?.plates || 'Sin placas'} &nbsp;|&nbsp; {trip.truck?._id || 'ID?'}
        </Text>
      </View>
    </TouchableOpacity>
  );
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

// --- ESTILOS ---
// Copiados/adaptados de CreateTripSheet para consistencia visual
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#eef3fa', paddingHorizontal: 20, paddingVertical: 11, marginTop: 8, borderRadius: 10
  },
  sectionTitle: { fontSize: 17.5, fontWeight: 'bold', color: '#14225a', letterSpacing: 0.1 },

  // --- Tarjeta principal ---
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
  // --- Placas/ID camión abajo ---
  bottomGray: {
    backgroundColor: '#f2f3f7',
    borderRadius: 10,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
    justifyContent: 'center'
  },
  platesText: {
    marginLeft: 6,
    color: '#888',
    fontSize: 14.4,
    fontWeight: '500'
  },
  // Badge
  badge: {
    flexDirection: 'row', alignItems: 'center', marginLeft: 8,
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: -2
  },
  emptyMsg: { color: "#999", marginLeft: 22, marginTop: 6, marginBottom: 12 }
});
