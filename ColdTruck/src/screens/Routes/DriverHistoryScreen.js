// DriverHistoryScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'; // Puedes agregar/quitar según ocupes
import { fetchDriverHistoryTrips } from '../../services/tripService';
import { reverseGeocodeOSM } from '../../services/geocodeService';
import { formatShortDate } from '../../utils/dateUtils'; // Ya tienes este util
import dayjs from 'dayjs'; // Si usas dayjs, útil para comparar fechas y agrupar

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

export default function DriverHistoryScreen({ navigation, route }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState({ today: false, lastWeek: false, earlier: false });
  const driverId = route.params?.driverId; // O como recibas el id

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchDriverHistoryTrips(driverId);
        const valid = (data || []).filter(t =>
          ["Completed", "Canceled", "Paused"].includes(t.status)
        );
        const withAddresses = await Promise.all(
          valid.map(async t => {
            const [orig, dest] = await Promise.all([
              t.rute?.origin?.coordinates ? reverseGeocodeOSM(t.rute.origin.coordinates) : { display_name: '' },
              t.rute?.destination?.coordinates ? reverseGeocodeOSM(t.rute.destination.coordinates) : { display_name: '' }
            ]);
            return {
              ...t,
              rute: {
                ...t.rute,
                originAddress: orig.display_name,
                destinationAddress: dest.display_name,
              },
            };
          })
        );
        if (!mounted) return;
        setTrips(withAddresses);
      } catch (e) {
        // handle error
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
  // Puedes hacer reverseGeocodeOSM(trip.rute.origin.coordinates) aquí para obtener la dirección
  // o usar un hook personalizado si quieres que la dirección salga bien formateada
  // Aquí para ejemplo pondré el name y ciudad, cambia cuando tengas los datos completos

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardTopRow}>
        <FontAwesome name="clock-o" size={18} color="#1976D2" style={{ marginRight: 8 }} />
        <Text style={styles.dateText}>{formatShortDate(trip.scheduledDepartureDate)}</Text>
        <StatusBadge status={trip.status} />
      </View>
      <View style={styles.odSection}>
        <MaterialCommunityIcons name="arrow-up-bold-circle" size={19} color="#1976D2" />
        <Text style={styles.address} numberOfLines={1}>
          {trip.rute?.originAddress || trip.rute?.name || 'Origen'}
        </Text>
      </View>
      <View style={styles.odSection}>
        <MaterialCommunityIcons name="arrow-down-bold-circle" size={19} color="#43b45e" />
        <Text style={styles.address} numberOfLines={1}>
          {trip.rute?.destinationAddress || trip.rute?.name || 'Destino'}
        </Text>
      </View>
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

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#eef3fa', paddingHorizontal: 20, paddingVertical: 11, marginTop: 8, borderRadius: 10
  },
  sectionTitle: { fontSize: 17.5, fontWeight: 'bold', color: '#14225a', letterSpacing: 0.1 },
  card: {
    marginHorizontal: 15, marginVertical: 7,
    backgroundColor: '#fff', borderRadius: 17, padding: 16,
    shadowColor: "#1976D2", shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  odSection: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 2 },
  address: { fontWeight: 'bold', color: '#28355d', fontSize: 16, marginLeft: 7 },
  dateText: { fontWeight: 'bold', color: '#28355d', fontSize: 15 },
  bottomGray: {
    backgroundColor: '#f2f3f7', borderRadius: 10, padding: 8, flexDirection: 'row',
    alignItems: 'center', marginTop: 15, justifyContent: 'center'
  },
  platesText: { marginLeft: 6, color: '#888', fontSize: 14.4, fontWeight: '500' },
  badge: {
    flexDirection: 'row', alignItems: 'center', marginLeft: 14,
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2,
  },
  emptyMsg: { color: "#999", marginLeft: 22, marginTop: 6, marginBottom: 12 }
});

