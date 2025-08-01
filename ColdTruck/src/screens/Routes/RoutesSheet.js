import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, PanResponder } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');
const SHEET_HEIGHT = Math.round(height * 0.46);
const UP_MARGIN = 95;
const SHEET_MIN = UP_MARGIN;
const SHEET_MAX = SHEET_HEIGHT + UP_MARGIN;


const FAKE_METRICS = {
  temp: 23.6,
  hum: 47,
  maxTemp: 28,
  minTemp: 14,
  maxHum: 60,
  minHum: 41,
  lastDate: '2024-08-02T17:24:00Z',
  alerts: [
    { type: 'temp', value: 86, hum: 47, date: '2024-08-02T15:10:00Z' },
    { type: 'hum', value: 20, hum: 20, date: '2024-08-02T13:30:00Z' }
  ]
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function RoutesSheet({ onClose }) {
  const [metrics, setMetrics] = useState(FAKE_METRICS);

  // Slide up/down animation
  const translateY = React.useRef(new Animated.Value(SHEET_MAX)).current;
  useEffect(() => {
    Animated.timing(translateY, {
      toValue: SHEET_MIN,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, []);

  // PanResponder para arrastrar sheet
  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gesture) => Math.abs(gesture.dy) > 6,
      onPanResponderGrant: () => {
        translateY.setOffset(translateY._value);
        translateY.setValue(0);
      },
      onPanResponderMove: (evt, gesture) => {
        let newY = Math.max(SHEET_MIN, Math.min(SHEET_MAX, gesture.dy + (translateY._offset ?? 0)));
        translateY.setValue(newY - (translateY._offset ?? 0));
      },
      onPanResponderRelease: (evt, gesture) => {
        translateY.flattenOffset();
        let currY = Math.max(SHEET_MIN, Math.min(SHEET_MAX, translateY._value));
        if (gesture.dy > 38 || currY > SHEET_MIN + 60) closeSheet();
        else openSheet();
      },
    })
  ).current;

  const openSheet = () => {
    Animated.timing(translateY, {
      toValue: SHEET_MIN,
      duration: 140,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: SHEET_MAX,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      if (onClose) onClose();
    });
  };

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeSheet} />
      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: SHEET_HEIGHT,
            bottom: 0,
            left: 0,
            right: 0,
            position: 'absolute',
            transform: [{ translateY }],
            zIndex: 999,
          },
        ]}
        pointerEvents="box-none"
      >
        {/* DragBar visual */}
        <View style={styles.dragBar} {...panResponder.panHandlers} />

        {/* MÉTRICAS */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 18 }}>
          {/* GRID DE MÉTRICAS */}
          <View style={styles.metricsGrid}>
            {/* FILA SUPERIOR */}
            <View style={styles.metricsRow}>
              {/* Temperatura */}
              <View style={styles.metricSquare}>
                <View style={styles.iconCircle}>
                  <Icon name="thermometer" size={23} color="#8BA0B3" />
                </View>
                <Text style={styles.metricLabelLeft}>Temperature</Text>
                <Text style={styles.metricValueLeft}>
                  {metrics.temp !== undefined ? metrics.temp.toFixed(1) : '--'}°C
                </Text>
              </View>
              {/* Humedad */}
              <View style={styles.metricSquare}>
                <View style={styles.iconCircle}>
                  <Icon name="water-outline" size={23} color="#8BA0B3" />
                </View>
                <Text style={styles.metricLabelLeft}>Humidity</Text>
                <Text style={styles.metricValueLeft}>
                  {metrics.hum !== undefined ? metrics.hum : '--'}%
                </Text>
              </View>
            </View>
            {/* FILA INFERIOR */}
            <View style={[styles.metricsRow, { marginBottom: 7 }]}>
              {/* Max/Min Temp */}
              
            </View>
            
            
                      </View>

          {/* ÚLTIMA LECTURA */}
          <View style={styles.lastReadingBox}>
            <MaterialCommunityIcons name="history" size={22} color="#8BA0B3" style={{ marginRight: 8 }} />
            <Text style={styles.lastReadingText}>
              Last reading: {formatDate(metrics.lastDate)}
            </Text>
          </View>

          {/* TARJETA DE ALERTAS (solo resumen, minimalista) */}
          <View style={styles.alertCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="alert-circle" size={22} color="#f8d24c" />
              <Text style={styles.alertSummary}>
                {metrics.alerts && metrics.alerts.length > 0
                  ? `There ${metrics.alerts.length === 1 ? 'is' : 'are'} ${metrics.alerts.length} alert${metrics.alerts.length > 1 ? 's' : ''} registered`
                  : 'No alerts registered'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#283d5b",
    opacity: 0.22,
    zIndex: 10,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 10,
    shadowColor: "#222", shadowOpacity: 0.10, shadowRadius: 14,
    pointerEvents: 'box-none',
    paddingBottom: 10,
  },
  dragBar: {
    width: 40,
    height: 5,
    borderRadius: 7,
    backgroundColor: '#c1d3ee',
    marginTop: 11,
    marginBottom: 12,
    alignSelf: 'center',
  },
  // === MÉTRICAS RECICLADAS ===
  metricsGrid: {
    width: '100%',
    marginBottom: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
    marginBottom: 6,
  },
  metricSquare: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 13,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 7,
    elevation: 2,
    minWidth: 115,
    maxWidth: 150,
    
  },
  metricLabelLeft: {
    fontSize: 14,
    color: '#49505eff',
    fontWeight: '600',
    marginBottom: 1,
    textAlign: 'left',
  },
  metricValueLeft: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#37485aff',
    textAlign: 'left',
    marginTop: 2,
  },
  metricSquareSmall: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2, 
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
    minWidth: 90,
    maxWidth: 120,
    height: 64, // Ahora miden igual
  },
  metricLabelTiny: {
    fontSize: 11, // Más pequeño
    color: '#728096',
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
    flexWrap: 'nowrap',
  },
  metricValueTiny: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#5fa8f7ff',
    textAlign: 'center',
    flex: 1,
  },
  rowLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 3,
    paddingHorizontal: 2, // Más compacto
    flexWrap: 'nowrap', // Nunca dos líneas
  },
  rowValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 2, // Más compacto
  },

  iconCircle: {
    borderWidth: 1.2,
    borderColor: '#E3E7ED',
    borderRadius: 12,
    padding: 6,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // === ÚLTIMA LECTURA ===
  lastReadingBox: {
    marginTop: 3,
    marginBottom: 6,
    backgroundColor: '#fff',
    borderRadius: 13,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  lastReadingText: {
    fontSize: 14,
    color: '#556072',
    fontWeight: '600',
    flex: 1,
  },
  // === TARJETA DE ALERTAS ===
  alertCard: {
    width: '100%',
    backgroundColor: '#fffbe8',
    borderRadius: 13,
    padding: 13,
    marginTop: 6,
    marginBottom: 7,
    shadowColor: '#F8D24C',
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 1,
    alignSelf: 'center',
  },
  alertSummary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#bca91f',
    marginLeft: 10,
  }
});

