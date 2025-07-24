import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  SafeAreaView,
} from 'react-native';

const truckImages = {
  Available: require('../../../assets/truck_available.png'),
  OnTrip: require('../../../assets/truck_ontrip.png'),
  Maintenance: require('../../../assets/truck_maintenance.png'),
  Inactive: require('../../../assets/truck_inactive.png'),
  Default: require('../../../assets/truck_default.png'),
};

const getTruckImage = (status) => {
  return truckImages[status] || truckImages['Default'];
};

// ===== MOCK DATA (simulando que haces el join) =====

const mockBrands = [
  { _id: 3, name: 'Freightliner' },
  { _id: 1, name: 'Kenworth' },
];

const mockModels = [
  { _id: 10, name: 'Everest', IDBrand: 3 },
  { _id: 1, name: 'T680', IDBrand: 1 },
];

const mockAdmins = [
  { _id: 5, name: 'Elias Jair Gomez' },
];

const mockTrucks = [
  {
    plates: 'FCX-123-1',
    status: 'Available',
    IDBrand: 3,
    IDModel: 10,
    IDAdmin: 5,
    loadCapacity: 4042,
    // Puedes agregar más datos mock si gustas
  },
];

// Helper para mock: buscar por ID
const findBrand = (id) => mockBrands.find((b) => b._id === id)?.name || 'N/A';
const findModel = (id) => mockModels.find((m) => m._id === id)?.name || 'N/A';
const findAdmin = (id) => mockAdmins.find((u) => u._id === id)?.name || 'N/A';

const statusColors = {
  Available: '#27ae60',
  OnTrip: '#2980b9',
  Maintenance: '#f39c12',
  Inactive: '#c0392b',
};

const TrucksScreen = () => {
  const [trucks, setTrucks] = useState(mockTrucks);

  // TODO: aquí va el fetch a tu backend y luego los "join" para obtener brand/model/admin

  const renderTruckCard = ({ item }) => (
    <View style={styles.card}>
      {/* Encabezado: camión a la izquierda, placa a la derecha */}
      <View style={styles.headerRow}>
        <Image source={getTruckImage(item.status)} style={styles.headerImage} />
        <View style={styles.plateBox}>
          <Text style={styles.plateText}>{item.plates}</Text>
        </View>
      </View>
      {/* ===== DATOS GRID ===== */}
      <View style={styles.gridRow}>
        <View style={styles.gridBox}>
          <Text style={styles.label}>Brand</Text>
          <Text style={styles.value}>{findBrand(item.IDBrand)}</Text>
        </View>
        <View style={styles.gridBox}>
          <Text style={styles.label}>Model</Text>
          <Text style={styles.value}>{findModel(item.IDModel)}</Text>
        </View>
      </View>
      <View style={styles.gridRow}>
        <View style={styles.gridBox}>
          <Text style={styles.label}>Admin</Text>
          <Text style={styles.value}>{findAdmin(item.IDAdmin)}</Text>
        </View>
        <View style={styles.gridBox}>
          <Text style={styles.label}>Load Capacity</Text>
          <Text style={styles.value}>{item.loadCapacity} kg</Text>
        </View>
      </View>
      <View style={styles.gridRow}>
        <View style={styles.gridBox}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, { color: statusColors[item.status] || '#000' }]}>
            {item.status}
          </Text>
        </View>
        {/* Aquí puedes agregar otro campo futuro */}
        <View style={styles.gridBox}>
          {/* Espacio reservado para próximos datos */}
          {/* Ejemplo: <Text style={styles.label}>Another field</Text>
                     <Text style={styles.value}>Value</Text> */}
        </View>
      </View>
      {/* === TODO/FETCH: Aquí veremos después detalles extendidos del camión/trip/rutas, etc. === */}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Truck Trip Details</Text>
      <FlatList
        data={trucks}
        keyExtractor={(item, idx) => item.plates + idx}
        renderItem={renderTruckCard}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fbff',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    color: '#124679',
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 20,
    textAlign: 'left',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    justifyContent: 'flex-start',
  },
  headerImage: {
    width: 128,
    height: 106,
    resizeMode: 'contain',
    marginRight: 14,
  },
  plateBox: {
    backgroundColor: '#fff9cc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 135,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  plateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridBox: {
    flex: 1,
    paddingHorizontal: 6,
  },
  label: {
    fontSize: 14,
    color: '#5678a9',
    marginBottom: 1,
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2c3e50',
  },
});

export default TrucksScreen;
