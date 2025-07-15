import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const truckStatus = {
  onRoute: 'On route',
  finished: 'Finished',
  pause: 'Paused',
};

const trucksData = [
  { id: 1, number: "TX-8234", destination: "Tijuana", temperature: "4.6°C", driver: "Juan Perez", status: "onRoute", plates: "ABC123" },
  { id: 2, number: "JKL-556", destination: "Mexicali", temperature: "--", driver: "Ana Gomez", status: "pause", plates: "DEF456" },
  { id: 3, number: "LOG-782", destination: "Rosarito", temperature: "7.1°C", driver: "Carlos Ruiz", status: "finished", plates: "XYZ789" },
];

export default function HomeScreen({ navigation, route }) {
  const userName = route?.params?.userName || "Mario";
  const [tab, setTab] = React.useState('all');
  const filtered = trucksData.filter(truck =>
    tab === 'all'
      ? true
      : tab === 'onRoute'
        ? truck.status === 'onRoute'
        : truck.status === 'finished'
  );

  return (
    <View style={styles.container}>
      {/* Header */}
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
        <TabBtn label="On Route" active={tab === 'onRoute'} onPress={() => setTab('onRoute')} />
        <TabBtn label="Finished" active={tab === 'finished'} onPress={() => setTab('finished')} />
      </View>
      {/* Truck Cards */}
      <FlatList
        data={filtered}
        style={{ flex: 1 }}
        keyExtractor={item => item.id + ""}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <MaterialCommunityIcons name="truck" size={26} color="#1976d2" />
              <Text style={styles.cardTitle}>{item.number} - {item.plates}</Text>
              <Text style={[
                styles.status,
                item.status === 'onRoute' ? styles.onRoute :
                item.status === 'finished' ? styles.finished : styles.paused
              ]}>
                {truckStatus[item.status] || item.status}
              </Text>
            </View>
            <Text style={styles.cardDest}>Destination: {item.destination}</Text>
            <Text style={styles.cardDriver}>Driver: {item.driver}</Text>
            <Text style={styles.cardTemp}>Temperature: {item.temperature}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: "#999", textAlign: 'center', marginTop: 16 }}>No trucks</Text>
        }
      />
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
