import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Image,
  PanResponder,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const SHEET_HEIGHT = Math.round(height * 0.59);
const UP_MARGIN = 75;
const SHEET_MIN = UP_MARGIN;
const SHEET_MAX = SHEET_HEIGHT + UP_MARGIN;

// Dummy data (cambia tus rutas)
const dummyTrucks = [
  { id: 1, identifier: "TX-8234", destino: "Centro de Distribución, Tijuana", temperatura: "4.6°C", conductor: "Juan Pérez", status: "en_ruta" },
  { id: 2, identifier: "JKL-556", destino: "Plaza Otay, Mexicali", temperatura: "--", conductor: "Ana Gómez", status: "pausa" },
  { id: 3, identifier: "LOG-782", destino: "Cedis Rosarito", temperatura: "7.1°C", conductor: "Carlos Ruiz", status: "finalizado" },
  { id: 4, identifier: "AX-942", destino: "Cedis Mexicali", temperatura: "6.2°C", conductor: "Luis Mena", status: "en_ruta" },
  { id: 5, identifier: "JP-654", destino: "San Luis", temperatura: "8.3°C", conductor: "Pedro Lira", status: "en_ruta" },
  { id: 6, identifier: "RV-111", destino: "Calexico", temperatura: "--", conductor: "Daniela Soto", status: "finalizado" },
  { id: 7, identifier: "ZT-900", destino: "Tecate", temperatura: "5.7°C", conductor: "Nora Páez", status: "pausa" },
  { id: 8, identifier: "OP-354", destino: "Almacén central", temperatura: "7.5°C", conductor: "Armando Vera", status: "en_ruta" },
];

// PNGs para estado (¡ajusta rutas a tus assets reales!)
const estadoImages = {
  en_ruta: require('../../../assets/truck_default.png'),
  pausa: require('../../../assets/truck_default.png'),
  finalizado: require('../../../assets/truck_default.png')
};

function chunkArray(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

export default function RoutesSheet({ onClose }) {
  const translateY = useRef(new Animated.Value(SHEET_MAX)).current;
  React.useEffect(() => {
    Animated.timing(translateY, {
      toValue: SHEET_MIN,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, []);

  // PanResponder para header y dragBar
  const panResponder = useRef(
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

  // Divide en “slides” de 4
  const pageSize = 4;
  const slides = chunkArray(dummyTrucks, pageSize);
  const [page, setPage] = useState(0);
  const flatListRef = useRef();

  const onScroll = e => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 46));
    setPage(idx);
  };

  return (
    <>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={closeSheet}>
        <Animated.View style={styles.backdrop} />
      </TouchableWithoutFeedback>

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
        <View style={styles.dragBar} />
        {/* Header con panHandlers */}
        <View style={styles.headerRow} {...panResponder.panHandlers}>
          <Text style={styles.title}>Camiones en Ruta</Text>
          <TouchableOpacity style={styles.filterBtn} onPress={() => alert("Próximamente: filtros")}>
            <MaterialIcons name="filter-list" size={21} color="#1976D2" />
            <Text style={styles.filterText}>Filtros</Text>
          </TouchableOpacity>
        </View>
        {/* Cards: carrusel horizontal, cada página con 4 */}
        <FlatList
          ref={flatListRef}
          horizontal
          pagingEnabled
          data={slides}
          keyExtractor={(_, i) => "slide" + i}
          showsHorizontalScrollIndicator={false}
          snapToInterval={width - 46}
          decelerationRate="fast"
          onScroll={onScroll}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 18 }}
          renderItem={({ item: group }) => (
            <View style={styles.cardsGrid}>
              {group.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.89}
                  style={styles.card}
                  onPress={() => alert("Detalles en desarrollo")}
                >
                  <Image source={estadoImages[item.status]} style={styles.estadoImg} />
                  <Text style={styles.identifier}>{item.identifier}</Text>
                  <Text style={styles.destino} numberOfLines={2}>{item.destino}</Text>
                  <Text style={styles.conductor}>{item.conductor}</Text>
                  <View style={styles.cardFooter}>
                    <MaterialIcons name="thermostat" size={16} color="#1976D2" />
                    <Text style={styles.temperatura}>{item.temperatura}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {/* Si hay menos de 4, rellena con “espacios vacíos” */}
              {group.length < 4 && Array.from({ length: 4 - group.length }).map((_, i) => (
                <View style={styles.card} key={"empty"+i} />
              ))}
            </View>
          )}
        />
        {/* Bolitas paginador */}
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { opacity: i === page ? 1 : 0.3, width: i === page ? 22 : 10 },
              ]}
            />
          ))}
        </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 23,
    justifyContent: 'space-between',
    marginBottom: 7,
    // Para mejorar el "área tocable" puedes aumentar el paddingVertical
    paddingTop: 7,
    paddingBottom: 7,
    zIndex: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#182654',
    letterSpacing: 0.2,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf4fb',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterText: {
    color: '#1976D2',
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 15,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: width - 46, // Debe coincidir con snapToInterval
    minHeight: 295,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 7,
    paddingBottom: 7,
    alignSelf: 'center',
  },
  card: {
    width: (width - 100) / 2,
    height: 130,
    backgroundColor: '#f6fbff',
    borderRadius: 15,
    padding: 13,
    marginBottom: 11,
    shadowColor: "#1976D2",
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estadoImg: {
    width: 35,
    height: 35,
    marginBottom: 5,
    resizeMode: 'contain',
  },
  identifier: {
    fontSize: 16,
    fontWeight: '700',
    color: '#25346e',
    textAlign: 'center',
    marginBottom: 3,
    letterSpacing: 0.18,
  },
  destino: {
    fontSize: 13.3,
    color: '#222d4e',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
    flexShrink: 1,
  },
  conductor: {
    fontSize: 13.2,
    color: '#4466a1',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  temperatura: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '600',
    marginLeft: 4,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  dot: {
    height: 8,
    borderRadius: 8,
    backgroundColor: '#1976D2',
    marginHorizontal: 3.5,
    marginBottom: 7,
  },
});
