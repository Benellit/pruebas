import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- MOCK DATA (puedes reemplazar por tu fetch real después) ---
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
  },
];




// Helper para mock: buscar por ID
const findBrand = (id) => mockBrands.find((b) => b._id === id)?.name || 'N/A';
const findModel = (id) => mockModels.find((m) => m._id === id)?.name || 'N/A';
const findAdmin = (id) => mockAdmins.find((u) => u._id === id)?.name || 'N/A';

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

const statusColors = {
  Available: '#27ae60',
  OnTrip: '#2980b9',
  Maintenance: '#f39c12',
  Inactive: '#c0392b',
};

// --- MOCK: Temperatura y Humedad actuales (integra con sensores luego) ---
const currentTemp = 23;
const currentHumidity = 51;
const maxTemp = 8;
const minTemp = -5;
const maxHum = 90;
const minHum = 20;


const TruckDetailsScreen = () => {
  const [activeTab, setActiveTab] = useState('General');
  const trucks = mockTrucks;

  // --- Render de la tarjeta de camión (como ya la tienes) ---
  const renderTruckCard = ({ item }) => (
    <View style={styles.card}>
      {/* Encabezado */}
      <View style={styles.headerRow}>
        <Image source={getTruckImage(item.status)} style={styles.headerImage} />
        <View style={styles.plateBox}>
          <Text style={styles.plateText}>{item.plates}</Text>
        </View>
      </View>
      {/* Datos en grid */}
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
        <View style={styles.gridBox}></View>
      </View>
    </View>
  );

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      {/* --- TABS BAR --- */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={activeTab === 'General' ? styles.tabActive : styles.tabInactive}
          onPress={() => setActiveTab('General')}
        >
          <Text style={activeTab === 'General' ? styles.tabTextActive : styles.tabTextInactive}>
            General
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab === 'Metrics' ? styles.tabActive : styles.tabInactive}
          onPress={() => setActiveTab('Metrics')}
        >
          <Text style={activeTab === 'Metrics' ? styles.tabTextActive : styles.tabTextInactive}>
            Metrics
          </Text>
        </TouchableOpacity>
      </View>
      {/* --- TABS CONTENT --- */}
      <View style={styles.content}>
        {activeTab === 'General' && (
          <>
                
              <View style={styles.metricsGrid}>
                {/* FILA SUPERIOR */}
                <View style={styles.metricsRow}>
              {/* Temperature */}
              <View style={styles.metricSquare}>
                <View style={styles.iconCircle}>
                  <Icon name="thermometer" size={32} color="#8BA0B3" />
                </View>
                <Text style={styles.metricLabelLeft}>Temperature</Text>
                <Text style={styles.metricValueLeft}>{currentTemp}°C</Text>
              </View>
              {/* Humidity */}
              <View style={styles.metricSquare}>
              <View style={styles.iconCircle}>
                <Icon name="water-outline" size={32} color="#8BA0B3" />
              </View>
                <Text style={styles.metricLabelLeft}>Humidity</Text>
                <Text style={styles.metricValueLeft}>{currentHumidity}%</Text>
              </View>
            </View>


                {/* FILA INFERIOR */}
                {/* FILA INFERIOR: Max/Min */}
              <View style={styles.metricsRow}>
                {/* Max/Min Temp */}
                <View style={styles.metricSquareSmall}>
                  <View style={styles.rowLabels}>
                    <Text style={[styles.metricLabelTiny, { color: '#728096' }]}>Max Temp</Text>
                    <Text style={styles.metricLabelTiny}>Min Temp</Text>
                  </View>
                  <View style={styles.rowValues}>
                    <Text style={[styles.metricValueTiny, { color: '#3e87cfff' }]}>{maxTemp}°C</Text>
                    <Text style={styles.metricValueTiny}>{minTemp}°C</Text>
                  </View>
                </View>
                {/* Max/Min Humidity */}
                <View style={styles.metricSquareSmall}>
                  <View style={styles.rowLabels}>
                    <Text style={[styles.metricLabelTiny, { color: '#728096' }]}>Max Hum</Text>
                    <Text style={styles.metricLabelTiny}>Min Hum</Text>
                  </View>
                  <View style={styles.rowValues}>
                    <Text style={[styles.metricValueTiny, { color: '#3e87cfff' }]}>{maxHum}%</Text>
                    <Text style={styles.metricValueTiny}>{minHum}%</Text>
                  </View>
                </View>
              </View>

              </View>

            {/* Card del camión */}
            {trucks.length > 0 && renderTruckCard({ item: trucks[0] })}

          </>
        )}
        {activeTab === 'Metrics' && (
          <View style={styles.metricsPlaceholder}>
            <Text style={styles.metricsText}>
              Here you will see historical charts and advanced metrics soon.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// --- STYLES (consolidados, incluye los de tabs y cards) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fbff',
  },
  // ----- TABS -----
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingTop: 40,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E3E7ED',
    alignItems: 'flex-end',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderColor: '#1976D2',
    marginRight: 32,
    paddingBottom: 4,
  },
  tabInactive: {
    borderBottomWidth: 0,
    paddingBottom: 4,
    marginRight: 32,
  },
  tabTextActive: {
    fontSize: 20,
    color: '#232E3A',
    fontWeight: 'bold',
  },
  tabTextInactive: {
    fontSize: 20,
    color: '#B0B7C3',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  // ----- METRICS CARDS -----

 metricsGrid: {
  width: '100%',
  marginBottom: 6,
},
metricsRow: {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  gap: 18,
  marginBottom: 16,
},
metricSquare: {
  flex: 1,
  backgroundColor: '#fff',
  borderRadius: 20,
  alignItems: 'flex-start', // <-- alineación a la izquierda
  justifyContent: 'center',
  paddingVertical: 16,
  paddingHorizontal: 18,
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 7,
  elevation: 2,
  minWidth: 130,
  maxWidth: 170,
},
metricLabelLeft: {
  fontSize: 16,
  color: '#49505eff',
  fontWeight: '600',
  marginBottom: 3,
  textAlign: 'left',
},
metricValueLeft: {
  fontSize: 25,
  fontWeight: 'bold',
  color: '#37485aff',
  textAlign: 'left',
  marginTop: 2,
},

metricSquareSmall: {
  flex: 1,
  backgroundColor: '#fff',
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 12,
  paddingHorizontal: 6,
  shadowColor: '#000',
  shadowOpacity: 0.07,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 3,
  elevation: 1,
  minWidth: 120,
  maxWidth: 160,
},
metricLabelSmall: {
  fontSize: 14,
  color: '#728096',
  fontWeight: '500',
  marginTop: 1,
  marginBottom: 0,
  textAlign: 'center',
},
metricValueSmall: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#1976D2',
  marginBottom: 4,
  textAlign: 'center',
},

// new no se que

rowLabels: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  marginBottom: 3,
  paddingHorizontal: 8,
},
rowValues: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  paddingHorizontal: 8,
},
metricLabelTiny: {
  fontSize: 12,
  color: '#728096',
  fontWeight: '500',
  textAlign: 'center',
  flex: 1,
},
metricValueTiny: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#5fa8f7ff',
  textAlign: 'center',
  flex: 1,
},

iconCircle: {
  borderWidth: 1.5,
  borderColor: '#E3E7ED',
  borderRadius: 14,
  padding: 9,
  marginBottom: 12,
  alignItems: 'center',
  justifyContent: 'center',
},

  // ----- CAMION CARD (igual que tu base) -----
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
  // ----- METRICS PLACEHOLDER -----
  metricsPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  metricsText: {
    fontSize: 19,
    color: '#B0B7C3',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default TruckDetailsScreen;
