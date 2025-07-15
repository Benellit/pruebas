import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Text, Dimensions, StyleSheet as RNStyleSheet, useColorScheme } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Octicons from '@expo/vector-icons/Octicons';
import * as Location from 'expo-location';
import { Marker, Polyline } from 'react-native-maps';
import { fetchRoute } from '../../services/routeService'; // Debe estar implementado
import FloatingSearchBar from './FloatingSearchBar';
import CreateTripSheet from './CreateTripSheet';
import RoutesSheet from './RoutesSheet';





import CustomMap from '../../components/MapComponents/CustomMap';

const { width, height } = Dimensions.get('window');

export default function RoutesScreen() {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme || 'light');
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const iconColor = theme === 'dark' ? '#fff' : '#222';
  const mapRef = useRef(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [zoom, setZoom] = useState(0.05);
  const [showRoutesSheet, setShowRoutesSheet] = useState(false);


  // ----- Ruta -----
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [routeMarkers, setRouteMarkers] = useState([]); // máximo 2 puntos
  const [route, setRoute] = useState([]); // coordenadas de la ruta
  const [showCreateTrip, setShowCreateTrip] = useState(false);


  // Presionar el mapa para marcar puntos (solo en modo ruta)
  const handleMapPress = ({ nativeEvent: { coordinate } }) => {
    if (!isRouteMode) return;
    if (routeMarkers.length < 2) {
      setRouteMarkers([...routeMarkers, coordinate]);
    }
  };

  // Cuando hay dos puntos, genera la ruta
  useEffect(() => {
    if (routeMarkers.length === 2) {
      fetchRoute(routeMarkers[0], routeMarkers[1])
        .then(setRoute)
        .catch(err => Alert.alert('Error', err.message));
    } else {
      setRoute([]); // Limpia si no hay dos puntos
    }
  }, [routeMarkers]);

  // Botón azul: activa modo ruta
  const handleRutaBtn = () => {
    setIsRouteMode(true);
    setRouteMarkers([]);
    setRoute([]);
    Alert.alert("API Ruta optimizada", "Toca dos puntos en el mapa para trazar la ruta.");
  };

  // ----------------

  // Centra el mapa en la ubicación del usuario al montar
  useEffect(() => {
    centerOnUser();
  }, []);

  // Centrar en la ubicación del usuario
  const centerOnUser = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso de ubicación denegado');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: zoom,
      longitudeDelta: zoom,
    };
    setMapRegion(region);
    if (mapRef.current && mapRef.current.animateToRegion) {
      mapRef.current.animateToRegion(region, 800);
    }
  };

  // Aumentar zoom
  const zoomIn = () => {
    if (!mapRegion) return;
    const newZoom = Math.max(0.002, zoom / 2);
    setZoom(newZoom);
    const region = { ...mapRegion, latitudeDelta: newZoom, longitudeDelta: newZoom };
    setMapRegion(region);
    if (mapRef.current && mapRef.current.animateToRegion) {
      mapRef.current.animateToRegion(region, 400);
    }
  };

  // Disminuir zoom
  const zoomOut = () => {
    if (!mapRegion) return;
    const newZoom = Math.min(0.5, zoom * 2);
    setZoom(newZoom);
    const region = { ...mapRegion, latitudeDelta: newZoom, longitudeDelta: newZoom };
    setMapRegion(region);
    if (mapRef.current && mapRef.current.animateToRegion) {
      mapRef.current.animateToRegion(region, 400);
    }
  };

  const showAlert = (msg) => Alert.alert('Info', msg);

  return (
    <View style={[styles.container, theme === 'dark' && { backgroundColor: '#0e1626' }]}>
      {/* Mapa */}
      <CustomMap
        ref={mapRef}
        region={mapRegion}
        showsUserLocation={true}
        style={RNStyleSheet.absoluteFillObject}
        onPress={handleMapPress}
        showsCompass={false}
        showsMyLocationButton={false}
        theme={theme}
      >
        {/* Mostrar marcadores y polilínea SOLO cuando estén los puntos */}
        {routeMarkers.map((marker, idx) => (
          <Marker
            key={`route-point-${idx}`}
            coordinate={marker}
            pinColor={idx === 0 ? 'green' : 'red'}
          />
        ))}
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeWidth={5}
            strokeColor="#1976D2"
          />
        )}
      </CustomMap>

      {/* Botón de menú 3 puntos arriba del zoom */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleTheme}>
        {theme === 'dark'
          ? <MaterialIcons name="wb-sunny" size={22} color={iconColor} />
          : <MaterialIcons name="nightlight-round" size={22} color={iconColor} />}
      </TouchableOpacity>


      {/* Esquina inferior derecha */}
      <View style={styles.rightButtons}>
        <TouchableOpacity style={styles.actionBtn} onPress={zoomIn}>
          <FontAwesome6 name="add" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={zoomOut}>
          <FontAwesome6 name="minus" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={centerOnUser}>
          <MaterialIcons name="my-location" size={24} color="#131b40" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.truckBtn}
          onPress={() => {
            setShowRoutesSheet(true);
            setShowCreateTrip(false);
          }}>
          <Octicons name="package-dependents" size={18} color="#131b40" style={{ marginRight: 8 }} />
          <Text style={styles.truckText}>Routes</Text>
        </TouchableOpacity>
      </View>

      {/* Esquina inferior izquierda */}
      <View style={styles.leftButtons}>
        <TouchableOpacity
            style={styles.blueFab}
            onPress={() => {
              setShowCreateTrip(true);
              setShowRoutesSheet(false);
            }}>
            <MaterialIcons name="share-location" size={48} color="#fff" />
          </TouchableOpacity>


        <TouchableOpacity style={styles.historyBtn} onPress={handleRutaBtn}>
            <Ionicons name="reader" size={30} color="#1a76fe" />
          </TouchableOpacity>

      </View>

      {!showCreateTrip && <FloatingSearchBar />}
      {showCreateTrip && <CreateTripSheet onClose={() => setShowCreateTrip(false)} />}
      {showRoutesSheet && <RoutesSheet onClose={() => setShowRoutesSheet(false)} />}


      {/* Barra de búsqueda flotante */}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ededed' },
  menuButton: {
    position: 'absolute',
    top: 120,
    right: 10,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 2, elevation: 3,
  },
  rightButtons: {
    position: 'absolute',
    bottom: 90,
    right: 10,
    alignItems: 'flex-end',
    gap: 12,
  },
  actionBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    shadowColor: "#000", shadowOpacity: 0.09, shadowRadius: 2, elevation: 2,
  },
  zoomSymbol: {
    fontSize: 22,
    color: '#25346e',
    fontWeight: 'bold',
    lineHeight: 29,
  },
  leftButtons: {
    position: 'absolute',
    bottom: 90,
    left: 10,
    alignItems: 'flex-start',
    gap: 8,
  },
  blueFab: {
    backgroundColor: '#1a76fe',
    borderRadius: 30,
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: "#1a76fe", shadowOpacity: 0.13, shadowRadius: 8, elevation: 5,
  },
  historyBtn: {
    backgroundColor: 'white',
    borderRadius: 22,
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },

  truckBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: 90,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    shadowColor: "#000", shadowOpacity: 0.09, shadowRadius: 2, elevation: 2,
  },
  truckText: {
    color: '#131b40',
    fontSize: 14,
    fontWeight: '600',
  },

  /* --- BARRA DE BÚSQUEDA --- */
  searchSectionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 3,
    paddingTop: 0,
    backgroundColor: '#edf6fe',
    alignItems: 'center',
    zIndex: 15,
    shadowColor: "#222",
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 2,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  dragBar: {
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
    opacity: 0.42,
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
});
