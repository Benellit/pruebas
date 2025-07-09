import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
  PanResponder,
  Keyboard,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const EXPANDED_HEIGHT = Math.round(height * 0.9);
const COLLAPSED_HEIGHT = 90;

// --- LÍMITES AJUSTABLES ---
const DOWN_OVERSHOOT = 15;     // Cuánto baja más allá de cerrado
const UP_MARGIN = 160;         // Hasta dónde sube (mínimo: deja 200px arriba)

// --- Ajuste de rango correcto ---
const SHEET_TOTAL_MOVEMENT = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
const SHEET_MIN = UP_MARGIN;                         // arriba (abierta)
const SHEET_MAX = SHEET_TOTAL_MOVEMENT + DOWN_OVERSHOOT; // abajo (cerrada + overshoot)

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function FloatingSearchBar({ onClose }) {
  const [dragging, setDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // Inicia cerrada (abajo)
  const translateY = useRef(new Animated.Value(SHEET_MAX)).current;

  // --- Interceptar botón atrás correctamente ---
  useEffect(() => {
    const handleBack = () => {
      if (isOpen) {
        closeSheet();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => sub.remove();
  }, [isOpen]);

  const openSheet = () => {
    setIsOpen(true);
    Animated.timing(translateY, {
      toValue: SHEET_MIN,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    setIsOpen(false);
    Animated.timing(translateY, {
      toValue: SHEET_MAX,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      if (onClose) onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gesture) => Math.abs(gesture.dy) > 6,
      onPanResponderGrant: () => {
        setDragging(true);
        translateY.setOffset(translateY._value);
        translateY.setValue(0);
      },
      onPanResponderMove: (evt, gesture) => {
        let newY = clamp(gesture.dy + (translateY._offset ?? 0), SHEET_MIN, SHEET_MAX);
        translateY.setValue(newY - (translateY._offset ?? 0));
      },
      onPanResponderRelease: (evt, gesture) => {
        translateY.flattenOffset();
        setDragging(false);
        let currY = clamp(translateY._value, SHEET_MIN, SHEET_MAX);

        if (gesture.dy < -35) openSheet();
        else if (gesture.dy > 35) closeSheet();
        else if (Math.abs(currY - SHEET_MIN) < Math.abs(currY - SHEET_MAX)) openSheet();
        else closeSheet();
      },
    })
  ).current;

  const backdropOpacity = translateY.interpolate({
    inputRange: [SHEET_MIN, SHEET_MAX],
    outputRange: [0.36, 0],
    extrapolate: 'clamp',
  });

  const dragBarAnimStyle = {
    opacity: dragging ? 0.7 : 1,
    transform: [{ scale: dragging ? 1.15 : 1 }],
    shadowOpacity: dragging ? 0.3 : 0.13,
    shadowRadius: dragging ? 8 : 7,
    elevation: dragging ? 10 : 2,
  };

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      />

      <Animated.View
        style={[
          styles.sheet,
          {
            height: EXPANDED_HEIGHT,
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
        <LinearGradient
          colors={['#edf3fe', '#ffffff']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderTopLeftRadius: 25, borderTopRightRadius: 25 }]}
        />
        {/* Header/barra de búsqueda */}
        <View style={{ alignItems: 'center', width: '100%' }}>
          <View
            style={{ width: '100%', alignItems: 'center' }}
            {...panResponder.panHandlers}
          >
            <Animated.View style={[styles.dragBarClosed, dragBarAnimStyle]} />
            <TouchableOpacity
              style={styles.searchBarContainer}
              activeOpacity={0.95}
              onPress={openSheet}
            >
              <View style={styles.inputFake}>
                <Ionicons name="search" size={22} color="#1976D2" style={{ marginLeft: 2, marginRight: 8 }} />
                <Text style={styles.searchPlaceholder}>Busqueda por criterios</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* Contenido que aparece al subir */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="location" size={23} color="#1976D2" style={{ marginRight: 12 }} />
            <View>
              <Text style={{ fontWeight: 'bold', fontSize: 17 }}>Oxxo</Text>
              <Text style={{ color: '#757575' }}>Calle 5 de Mayo, Maclovio Rojas, 22...</Text>
            </View>
            <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#aaa', fontSize: 13, marginRight: 6 }}>691 m</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteHistory}>
            <Text style={{ color: '#223', fontWeight: 'bold' }}>Borrar todo el historial</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 12,
    shadowColor: "#222", shadowOpacity: 0.13, shadowRadius: 14,
    pointerEvents: 'box-none',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#283d5b",
  },
  dragBarClosed: {
    width: 40,
    height: 5,
    borderRadius: 7,
    backgroundColor: '#c1d3ee',
    marginTop: 7,
    marginBottom: 6,
    alignSelf: 'center',
  },
  searchBarContainer: {
    width: width - 34,
    height: 41,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf1fa',
    borderColor: '#1976D2',
    borderWidth: 2,
    borderRadius: 12,
    shadowColor: "#2976D2",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    marginTop: 4,
    marginBottom: 12,
    marginHorizontal: 5,
  },
  searchPlaceholder: {
    color: '#1a2e56',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 5,
    letterSpacing: 0.07,
    opacity: 0.62,
  },
  inputFake: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 37,
    paddingHorizontal: 10,
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 19,
    marginTop: 6,
  },
  listItem: {
    backgroundColor: '#edf3fe',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 11,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#e3eefd',
  },
  deleteHistory: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
    padding: 6,
  },
});
