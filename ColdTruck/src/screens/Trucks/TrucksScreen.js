import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';


const truckImages = {
  Available: require('../../../assets/truck_available.png'),
  OnTrip: require('../../../assets/truck_ontrip.png'),
  Maintenance: require('../../../assets/truck_maintenance.png'),
  Inactive: require('../../../assets/truck_inactive.png'),
  Default: require('../../../assets/truck_default.png'),
};

const mockTrucks = [
  {
    number: 'T001',
    plates: 'ABC123',
    status: 'Available',
    loadCapacity: 8000,
    IDAdmin: 'A1',
    IDBrand: 'B1',
    IDModel: 'M1',
  },
  {
    number: 'T002',
    plates: 'DEF456',
    status: 'OnTrip',
    loadCapacity: 9000,
    IDAdmin: 'A2',
    IDBrand: 'B2',
    IDModel: 'M2',
  },
  {
    number: 'T003',
    plates: 'XYZ789',
    status: 'Inactive',
    loadCapacity: 9500,
    IDAdmin: 'A3',
    IDBrand: 'B1',
    IDModel: 'M2',
  },
];

const getTruckImage = (status) => {
  if (truckImages[status]) return truckImages[status];
  return truckImages['Default'];
};

const TrucksScreen = () => {
  // Aquí luego reemplazas por tus datos del backend
  const [trucks, setTrucks] = useState(mockTrucks);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState(mockTrucks);

  useEffect(() => {
    if (!search) {
      setFiltered(trucks);
    } else {
      const txt = search.toLowerCase();
      setFiltered(
        trucks.filter(
          (truck) =>
            truck.number.toLowerCase().includes(txt) ||
            truck.plates.toLowerCase().includes(txt)
        )
      );
    }
  }, [search, trucks]);

  const renderTruck = ({ item }) => (
    <TouchableOpacity
      style={styles.truckCard}
      // TODO: Implementar navegación a detalles
      onPress={() => {}}
      activeOpacity={0.8}
    >
      <Image
        source={getTruckImage(item.status)}
        style={styles.truckImage}
        resizeMode="contain"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.truckNumber}>{item.number}</Text>
        <Text style={styles.plates}>Plates: {item.plates}</Text>
        <Text style={styles.statusLabel}>
          Status:{' '}
          <Text style={[styles.status, statusColors[item.status] || {}]}>
            {item.status}
          </Text>
        </Text>
        <Text style={styles.loadCapacity}>
          Load Capacity: {item.loadCapacity} kg
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header / Title */}
      <Text style={styles.header}>All Trucks</Text>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Find Truck"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#7fa7da"
        />
      </View>
      {/* FlatList of trucks */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.number}
        renderItem={renderTruck}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#aaa', marginTop: 20 }}>
            No trucks found.
          </Text>
        }
      />
    </View>
  );
};

// Color para cada status (paleta azulada, fácil de modificar)
const statusColors = {
  Available: { color: '#27ae60' }, // Verde
  OnTrip: { color: '#2980b9' },    // Azul fuerte
  Maintenance: { color: '#f39c12' }, // Naranja/Amarillo
  Inactive: { color: '#c0392b' },    // Rojo
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fbff',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#124679',
    marginBottom: 10,
    marginTop: 15,
    letterSpacing: 1,
  },
  searchContainer: {
    backgroundColor: '#e6eef8',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#124679',
    fontWeight: '500',
  },
  truckCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  truckImage: {
    width: 56,
    height: 56,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  truckNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#124679',
    marginBottom: 2,
  },
  plates: {
    fontSize: 15,
    color: '#5277a6',
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
  },
  status: {
    fontWeight: 'bold',
  },
  loadCapacity: {
    fontSize: 14,
    color: '#5678b9',
    marginTop: 2,
  },
});

export default TrucksScreen;
