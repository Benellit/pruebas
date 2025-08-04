import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import { fetchTripsForDriver } from '../../services/tripService';
import { fetchTruck } from '../../services/truckService';
import { fetchRute } from '../../services/ruteService';
import { fetchUser } from '../../services/userService';
import { fetchCargoType } from '../../services/cargoTypeService';
import { getValidTrips } from '../../utils/tripUtils';
import { showTrackingMessage } from '../../utils/flashMessage';

const statusLabels = {
  'Scheduled': 'Scheduled',    
  'Completed': 'Finished',
  'Paused': 'Paused'
};

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const userName = user?.name || 'Driver';
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);

  console.log('user:', user);

  const notifyNewTrips = async (tripsList) => {
    try {
      const stored = await AsyncStorage.getItem('seenTripIds');
      const seenIds = stored ? JSON.parse(stored) : [];
      const newTrips = tripsList.filter(t => !seenIds.includes(t._id));
      if (newTrips.length > 0) {
        newTrips.forEach(t => showTrackingMessage('info', `Nuevo viaje asignado: ${t._id}`));
        const updated = [...seenIds, ...newTrips.map(t => t._id)];
        await AsyncStorage.setItem('seenTripIds', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Error checking new trips', err);
    }
  };


  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    setLoading(true);
    fetchTripsForDriver(user.id)
      .then(async data => {
        console.log('data de backend:', data);
        if (!isMounted) return;
        const enriched = await Promise.all(data.map(async (trip) => {
          try {
            const [truck, rute, admin, cargoType] = await Promise.all([
              fetchTruck(trip.IDTruck),
              fetchRute(trip.IDRute),
              fetchUser(trip.IDAdmin),
              fetchCargoType(trip.IDCargoType)
            ]);
            return { ...trip, truck, rute, admin, cargoType };
          } catch {
            return trip;
          }
        }));
        setTrips(enriched);
        await notifyNewTrips(enriched);
        console.log('enriched trips:', enriched);
      })
      .catch(() => setTrips([]))
      .finally(() => isMounted && setLoading(false));
    return () => { isMounted = false; };
  }, [user]);

  
  const validTrips = getValidTrips(trips, { includeCompleted: true });
  const nextTrip = getValidTrips(trips)[0];
  const filtered = validTrips.filter(trip =>
  tab === 'all'
    ? true
    : tab === 'scheduled'
      ? trip.status === 'Scheduled'
      : tab === 'finished'
        ? trip.status === 'Completed'
        : true
);




  return (
    <View style={styles.container}>
      {/* Header (el boton no tiene funcion y no tendra)*/}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBox} onPress={() => navigation.navigate('Home')}>
          <MaterialIcons name="dashboard" size={26} color="#174eaf" />
        </TouchableOpacity>
        <View>
          <Text style={styles.welcome}>Welcome, {userName}</Text>
          <Text style={styles.subtitle}>Overview of your fleet and routes</Text>
        </View>
      </View>
      {/* Shortcut Buttons */}
      <View style={styles.buttonsRow}>
        <ButtonMain icon="map-marker-path" label="Routes" onPress={() => navigation.navigate('Routes')} />
        <ButtonMain icon="truck" label="Trucks" onPress={() => navigation.navigate('Trucks')} />
        <ButtonMain icon="bell" label="Alerts" onPress={() => navigation.navigate('Notifications')} />
      </View>
      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TabBtn label="All" active={tab === 'all'} onPress={() => setTab('all')} />
        <TabBtn label="Scheduled" active={tab === 'scheduled'} onPress={() => setTab('scheduled')} />
        <TabBtn label="Finished" active={tab === 'finished'} onPress={() => setTab('finished')} />
      </View>
      {/* Truck Cards */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filtered}
          style={{ flex: 1 }}
          keyExtractor={item => String(item._id)}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <MaterialCommunityIcons name="truck" size={26} color="#1976d2" />
                <Text style={styles.cardTitle}>{item._id} - {item.truck?.plates}</Text>
                <Text style={[
                  styles.status,
                  item.status === 'In Transit' ? styles.onRoute :
                  item.status === 'Completed' ? styles.finished : styles.paused
                ]}>
                  {statusLabels[item.status] || item.status}
                </Text>
              </View>
              <Text style={styles.cardDest}>{item.rute?.name}</Text>
              <Text style={styles.cardDriver}>Assigned by: {item.admin?.name}</Text>
              <Text style={styles.cardTemp}>Type of load: {item.cargoType?.name}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#999", textAlign: 'center', marginTop: 16 }}>No hay rutas activas</Text>
          }
        />
      )}
    </View>
  );
}

function ButtonMain({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.mainBtn} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={28} color="#1976d2" />
      <Text style={styles.mainBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function TabBtn({ label, active, onPress }) {
  return (
    <TouchableOpacity style={[styles.tabBtn, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fbff", paddingHorizontal: 18, paddingTop: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: {
    width: 44, height: 44, backgroundColor: "#eaf1fb",
    borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14, marginTop: 35,
  },
  welcome: { fontSize: 23, fontWeight: 'bold', color: '#182654', letterSpacing: 0.3, marginTop: 35, marginBottom: 2 },
  subtitle: { fontSize: 15.3, color: '#5d749e', fontWeight: '500', marginTop: 2 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, gap: 10, marginTop: 10 },
  mainBtn: {
    flex: 1, backgroundColor: "#fff", borderRadius: 15, padding: 13,
    alignItems: 'center', justifyContent: 'center', shadowColor: "#000",
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 1,
  },
  mainBtnText: { fontSize: 15.4, fontWeight: '600', color: '#1976d2', marginTop: 6 },
  tabsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9, backgroundColor: "#f4f7fb", borderRadius: 12, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabText: { fontSize: 14.8, color: "#5376ad", fontWeight: '500' },
  tabActive: { backgroundColor: "#e7eef8" },
  tabTextActive: { color: "#1976d2", fontWeight: 'bold' },
  card: {
    backgroundColor: "#fff", borderRadius: 15, marginBottom: 13, padding: 13,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
    borderColor: "#ececec", borderWidth: 1,
  },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#184081', marginLeft: 8, flex: 1 },
  status: { marginLeft: 7, fontWeight: '700', fontSize: 13 },
  onRoute: { color: "#1976d2" },
  finished: { color: "#7d95b3" },
  paused: { color: "#f2aa00" },
  cardDest: { color: "#23314b", fontSize: 14.3, marginTop: 2 },
  cardDriver: { color: "#4e659c", fontSize: 14, marginTop: 2 },
  cardTemp: { color: "#1976d2", fontSize: 13.2, marginTop: 2, fontWeight: 'bold' },
});
