import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { fetchTripsForTruck } from '../../services/tripService';

dayjs.extend(relativeTime);

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


const maxTemp = 8;
const minTemp = -5;
const maxHum = 90;
const minHum = 20;



const alertColors = {
  temperature: {
    bg: '#e7f0fd',
    border: '#1976d2',
    icon: '#1976d2',
    value: '#1976d2',
    label: '#8bb7e5',
  },
  humidity: {
    bg: '#fff6ec',
    border: '#e8870b',
    icon: '#e8870b',
    value: '#e8870b',
    label: '#f3b860',
  },
};
const TrucksScreen = ({ route }) => {
  const [activeTab, setActiveTab] = useState('General');
  const [truck, setTruck] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const truckId = route?.params?.truckId ?? 1;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { truck: truckData, alerts: alertsData } = await fetchTripsForTruck(truckId);
        const enhancedAlerts = alertsData.map((a) => {
          const level = a.valueLabel === '°C' ? 'temperature' : a.valueLabel === '%' ? 'humidity' : null;
          const dateObj = new Date(a.dateTime);
          return {
            ...a,
            level,
            timeAgo: dayjs(dateObj).fromNow(),
            date: dateObj.toLocaleString(),
          };
        });
        
        setTruck(truckData);
        setAlerts(enhancedAlerts);
      } catch (err) {
        console.error('Error cargando datos del camión', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [truckId]);

  const alertSummary = {
    total: alerts.length,
    temperature: alerts.filter((a) => a.level === 'temperature').length,
    humidity: alerts.filter((a) => a.level === 'humidity').length,
  };

  const latestTempAlert = alerts.find((a) => a.level === 'temperature');
  const latestHumAlert = alerts.find((a) => a.level === 'humidity');
  const currentTemp = latestTempAlert ? latestTempAlert.value : 0;
  const currentHumidity = latestHumAlert ? latestHumAlert.value : 0;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
          style={activeTab === 'Alerts' ? styles.tabActive : styles.tabInactive}
          onPress={() => setActiveTab('Alerts')}
        >
          <Text style={activeTab === 'Alerts' ? styles.tabTextActive : styles.tabTextInactive}>
            Alerts
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>

        {/* ==================== GENERAL TAB ==================== */}
        {activeTab === 'General' && (
          truck ? (
            <>
              {/* MÉTRICAS */}
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
              {renderTruckCard({ item: truck })}
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Sin datos</Text>
            </View>
          )
        )}

        {/* ==================== ALERTS TAB ==================== */}
        {activeTab === 'Alerts' && (
          <TruckAlertsMetrics alerts={alerts} summary={alertSummary} />
        )}
      </View>
    </SafeAreaView>
  );
};

/////////////////////////////////////////////////////////////////////////////////////
// --- ALERTS TAB ---
function TruckAlertsMetrics({ alerts, summary }) {
  return (
    <View style={alertStyles.container}>
      {/* Header/Resumen todo en una tarjeta */}
      <View style={alertStyles.summaryCardBig}>
        <View style={alertStyles.summaryRowFlex}>
          <MaterialCommunityIcons name="alert-circle" size={33} color="#f76e46" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={alertStyles.headerTitle}>Truck Alert Center</Text>
            <Text style={alertStyles.headerDesc}>All temperature and humidity alerts for this truck</Text>
          </View>
        </View>
      </View>
      {/* Summary Cards van aquí debajo */}
      <View style={alertStyles.alertNumsRow}>
       <SummaryCard icon="alert" value={summary.total} color="#f76e46" label="Total" />
        <SummaryCard
          icon="thermometer"
          value={summary.temperature}
          color={alertColors.temperature.icon}
          label="Temperature"
        />
        <SummaryCard
          icon="water-outline"
          value={summary.humidity}
          color={alertColors.humidity.icon}
          label="Humidity"
        />
      </View>



      {/* Recents título */}
      <Text style={alertStyles.recentsTitle}>Latest alerts:</Text>

      {/* Lista de alertas */}
      <FlatList
         data={alerts}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => <AlertCard alert={item} />}
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 5 }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function SummaryCard({ icon, value, color, label }) {
  return (
    <View style={alertStyles.summaryNumCard}>
      {/* Label arriba */}
      <Text style={alertStyles.summaryLabel}>{label}</Text>
      {/* Icono y número juntos abajo */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
        <Text style={alertStyles.summaryValue}>{value}</Text>
      </View>
    </View>
  );
}




function AlertCard({ alert }) {
  const c = alertColors[alert.level] || alertColors.temperature;
  return (
    <View style={[alertStyles.alertCard, { backgroundColor: c.bg, borderColor: c.border }]}>
      <View style={alertStyles.alertRow}>
        {/* Valor destacado */}
        <View style={[alertStyles.alertValueBadge, { borderColor: c.border, flexDirection: 'row', alignItems: 'center', paddingVertical: 0 }]}>
        <Text style={[alertStyles.alertValueBadgeNum, { color: c.border, marginRight: 3 }]}>{alert.value}</Text>
        <Text style={[alertStyles.alertValueBadgeUnit, { color: c.border }]}>{alert.valueLabel}</Text>
      </View>


        {/* Icono + tipo */}
        <MaterialCommunityIcons
          name={alert.level === 'humidity' ? 'water-outline' : 'trending-up'}
          size={22}
          color={c.icon}
          style={{ marginLeft: 4, marginRight: 1 }}   
        />
        <Text style={[alertStyles.alertTitle, { color: c.icon }]}>{alert.type}</Text>


        {/* Tiempo */}
        <Text style={alertStyles.alertAgo}>{alert.timeAgo}</Text>
      </View>
      <Text style={alertStyles.alertDesc}>{alert.description}</Text>
      {/* Footer: Trip, Truck, Fecha */}
      <View style={alertStyles.alertFooter}>
        <View style={alertStyles.alertFooterItem}>
          <MaterialCommunityIcons name="source-branch" size={15} color="#b1b9c7" />
          <Text style={alertStyles.alertFooterText}>Trip #{alert.tripId}</Text>
        </View>
        <View style={alertStyles.alertFooterItem}>
          <MaterialIcons name="local-shipping" size={15} color="#b1b9c7" />
          <Text style={alertStyles.alertFooterText}>{alert.truckPlates}</Text>
        </View>
        <View style={alertStyles.alertFooterItem}>
          <MaterialCommunityIcons name="clock-outline" size={15} color="#b1b9c7" />
          <Text style={alertStyles.alertFooterText}>{alert.date}</Text>
        </View>
      </View>
    </View>
  );
}

/////////////////////////////////////////////////////////////////////////////////////
// --- COMPONENTES Y ESTILOS DE GENERAL ---
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
        <Text style={styles.value}>{item.brand?.name || item.IDBrand}</Text>
      </View>
      <View style={styles.gridBox}>
        <Text style={styles.label}>Model</Text>
        <Text style={styles.value}>{item.model?.name || item.IDModel}</Text>
      </View>
    </View>
    <View style={styles.gridRow}>
      <View style={styles.gridBox}>
        <Text style={styles.label}>Admin</Text>
        <Text style={styles.value}>{item.admin?.name || item.IDAdmin}</Text>
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

/////////////////////////////////////////////////////////////////////////////////////
// --- ESTILOS DE GENERAL ---
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
   noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#49505eff',
  },
  // ----- MÉTRICAS CARDS -----
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
    alignItems: 'flex-start',
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
  // ----- CAMION CARD -----
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

/////////////////////////////////////////////////////////////////////////////////////
// --- ESTILOS DE ALERTAS ---
const alertStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fb',
    paddingHorizontal: 0,
    paddingTop: 2,
  },
  summaryCardBig: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 2,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#1976D2',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1.2,
    borderColor: '#e5eaf6',
  },
  summaryRowFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#252E43',
    marginBottom: 2,
  },
  headerDesc: {
    fontSize: 13.2,
    color: '#76849a',
    fontWeight: '500',
    letterSpacing: 0.09,
    marginBottom: 0,
  },
  alertNumsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 6,
  },
  summaryNumCard: {
  flex: 1,
  backgroundColor: '#fff',
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 11,
  marginHorizontal: 5,
  borderWidth: 1.2,
  borderColor: '#e0e7f6',
  minWidth: 90,
  maxWidth: 140,
},
summaryValue: {
  fontWeight: 'bold',
  fontSize: 18,
  color: '#232E3A',
  marginLeft: 6,    // Pequeño espacio entre icono y número
},
summaryLabel: {
  fontSize: 13,
  fontWeight: '600',
  color: '#7a879d',
  marginTop: 0,
  marginBottom: 6,
  textAlign: 'center',
},

alertNumsRow: {
  flexDirection: 'row',
  alignItems: 'stretch',
  justifyContent: 'space-between',
  width: '100%',
  marginBottom: 13,
  marginTop: -6,
},

  recentsTitle: {
    fontWeight: 'bold',
    color: '#28355d',
    fontSize: 15.8,
    marginLeft: 3,
    marginBottom: 6,
    marginTop: 2,
    letterSpacing: 0.08,
  },
  alertCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    marginHorizontal: 2,
    marginBottom: 14,
    backgroundColor: '#fff',
    shadowColor: '#1976D2',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  alertValueBadge: {
  borderWidth: 1.7,
  borderColor: '#1976d2',
  borderRadius: 8,
  paddingHorizontal: 8,
  paddingVertical: 0,
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 38,
  marginRight: 4,
  flexDirection: 'row',   // <-- Añadir
},
alertValueBadgeNum: {
  fontSize: 16,
  fontWeight: 'bold',
  letterSpacing: 0.4,
  marginRight: 3,         // <-- Añadir para separar el número de la unidad
},
alertValueBadgeUnit: {
  fontSize: 13,
  fontWeight: '500',
  marginTop: 0,
},

  alertTitle: {
    fontWeight: 'bold',
    fontSize: 15.2,
    marginLeft: 8,
    marginRight: 6,
  },
  alertAgo: {
    marginLeft: 'auto',
    color: '#7f8797',
    fontSize: 12.7,
    fontWeight: '500',
  },
  alertDesc: {
    fontSize: 13.4,
    color: '#2b3a53',
    marginBottom: 7,
    marginLeft: 3,
    marginTop: 7,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
    borderTopWidth: 1,
    borderTopColor: '#ecedf3',
    paddingTop: 5,
    marginLeft: 1,
  },
  alertFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 7,
    gap: 3,
  },
  alertFooterText: {
    marginLeft: 3,
    color: '#788098',
    fontSize: 12.2,
    fontWeight: '500',
  },
});

export default TrucksScreen;
