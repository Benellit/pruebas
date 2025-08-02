import React, { useRef, useEffect, useState, useContext } from 'react';

import { View, StyleSheet, TouchableOpacity, Alert, Text, Dimensions, StyleSheet as RNStyleSheet, useColorScheme } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Octicons from '@expo/vector-icons/Octicons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Marker, Polyline } from 'react-native-maps';
import { fetchRoute } from '../../services/routeService'; 
import FloatingSearchBar from './FloatingSearchBar';
import CreateTripSheet from './CreateTripSheet';
import RoutesSheet from './RoutesSheet';
import { AuthContext } from '../../context/AuthContext';
import { MapMarkers } from '../../components/MapComponents/MapMarkers'; 
import PinOrigen from '../../../assets/pinOrigen.png';
import PinDestino from '../../../assets/pinDestino.png';
import ArrowImg from '../../../assets/arrow.png';



import CustomMap from '../../components/MapComponents/CustomMap';

const { width, height } = Dimensions.get('window');

const NAV_PITCH = 55;
const themeColors = {
  light: {
    background: '#ededed',
    card: '#fff',
    text: '#131b40',
    searchBg: '#eaf1fa',
    searchSection: '#edf6fe',
    icon: '#222',       // iconos generales en fondo claro
    iconActive: '#1976D2', // azul para resaltar (opcional)
    blueFabBg: '#1a76fe',  // fondo del botón especial
    blueFabIcon: '#fff',   // ícono blanco en el FAB azul
    blueFabBg: '#1a76fe',  // fondo azul
    blueFabIcon: '#fff',   // icono blanco en modo claro
  },
  dark: {
    background: '#0e1626',
    card: '#1b263b',
    text: '#fff',
    searchBg: '#152a3a',
    searchSection: '#1f2d3d',
    icon: '#fff',       // iconos generales en fondo oscuro
    iconActive: '#8ec3b9', // azul claro o acento (opcional)
    blueFabBg: '#152a3a',  // mismo azul, puedes oscurecer si quieres
    blueFabIcon: '#fff',   // sigue siendo blanco
    blueFabBg: '#152a3a',  // fondo azul (puedes cambiarlo si quieres)
    blueFabIcon: '#fff',   // icono negro en modo oscuro
  },
};


export default function RoutesScreen() {
  const { user } = useContext(AuthContext);
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme || 'light');
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const iconColor = theme === 'dark' ? '#fff' : '#222';
  const navigation = useNavigation();

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: [{ height: 70 }, { backgroundColor: themeColors[theme].card }],
      tabBarActiveTintColor: theme === 'dark' ? '#fff' : '#046bc8',
      tabBarInactiveTintColor: theme === 'dark' ? '#9aa0b5' : '#046bc8',
    });
  }, [navigation, theme]);

  const t = themeColors[theme];
  const mapRef = useRef(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [zoom, setZoom] = useState(0.05);
  const [showRoutesSheet, setShowRoutesSheet] = useState(false);

  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [heading, setHeading] = useState(0);
  const [locationWatcher, setLocationWatcher] = useState(null);

  // ----- Ruta -----
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [routeMarkers, setRouteMarkers] = useState([]); // máximo 2 puntos
  const [route, setRoute] = useState([]); // coordenadas de la ruta
  const [autoRouteMarkers, setAutoRouteMarkers] = useState([]);
  const [autoRoute, setAutoRoute] = useState([]);
  const [navRoute, setNavRoute] = useState([]);
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
      setAutoRouteMarkers([]);
      setAutoRoute([]);
    }
  }, [routeMarkers]);

  // Botón azul: activa modo ruta
  const handleRutaBtn = () => {
    setIsRouteMode(true);
    setRouteMarkers([]);
    setRoute([]);
    Alert.alert("API Ruta optimizada", "Toca dos puntos en el mapa para trazar la ruta.");
  };

const showAssignedRoute = async (originCoords, destinationCoords) => {
  if (!originCoords || !destinationCoords) return;
  if (isNavigating) return;
  const start = { latitude: originCoords[1], longitude: originCoords[0] };
  const end = { latitude: destinationCoords[1], longitude: destinationCoords[0] };

  // Aquí está el cambio clave, usa los mismos estados que el botón history
  setRouteMarkers([start, end]);

  try {
    const pts = await fetchRoute(start, end);
    setRoute(pts);
  } catch (err) {
    Alert.alert('Error', err.message);
  }

  const midLat = (start.latitude + end.latitude) / 2;
  const midLng = (start.longitude + end.longitude) / 2;
  const latDelta = Math.max(Math.abs(start.latitude - end.latitude) * 1.8, 0.05);
  const lngDelta = Math.max(Math.abs(start.longitude - end.longitude) * 1.8, 0.05);

  const region = {
    latitude: midLat,
    longitude: midLng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
  if (!isNavigating) { // CAMERA_FIX
    setMapRegion(region);
    if (mapRef.current && mapRef.current.animateToRegion) {
      mapRef.current.animateToRegion(region, 800);
    }
  }

  // Desactiva modo ruta manual para evitar conflicto
  setIsRouteMode(false);
};

const startNavigation = async (originCoords, destinationCoords) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso de ubicación denegado');
        return;
      }

      const initial = await Location.getCurrentPositionAsync({});
      const { latitude, longitude, heading: hdg } = initial.coords;
      const currPos = { latitude, longitude };
      setCurrentPosition(currPos);
      setHeading(hdg || 0);

      if (mapRef.current) {
        // NAVIGATION_FIX pitch the camera when starting navigation
        mapRef.current.animateCamera(
          {
            center: currPos,
            heading: hdg || 0,
            pitch: NAV_PITCH,
            zoom: 18,
          },
          { duration: 500 }
        );
      }

      if (originCoords && destinationCoords) {
        const origin = { latitude: originCoords[1], longitude: originCoords[0] };
        const dest = { latitude: destinationCoords[1], longitude: destinationCoords[0] };

        setRouteMarkers([origin, dest]);

        const destLeg = route.length === 0 ? await fetchRoute(origin, dest) : route; // NAVIGATION_FIX fetch optimized
        if (route.length === 0) setRoute(destLeg);

        const firstLeg = await fetchRoute(currPos, origin); // NAVIGATION_FIX
        const combined = [...firstLeg, ...destLeg.slice(1)];
        setNavRoute(combined);
      } else {
        setNavRoute([]);
      }

      const watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        ({ coords }) => {
          const { latitude: lat, longitude: lon, heading: hdg2 } = coords;
          const pos = { latitude: lat, longitude: lon };
          setCurrentPosition(pos);
          setHeading(hdg2 || 0);

          if (mapRef.current) {
            // NAVIGATION_FIX keep pitch while following
            mapRef.current.animateCamera(
              {
                center: pos,
                heading: hdg2 || 0,
                pitch: NAV_PITCH,
                zoom: 18,
              },
              { duration: 500 }
            );
          }

        
        }
      );

      setLocationWatcher(watcher);
      setIsNavigating(true);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const stopNavigation = () => {
    if (locationWatcher) {
      locationWatcher.remove();
      setLocationWatcher(null);
    }
    if (mapRef.current) {
      // NAV3D reset camera pitch when leaving navigation
      mapRef.current.animateCamera({ pitch: 0 }, { duration: 300 });
    }

    if (currentPosition) { // CAMERA_FIX restore region control
      const region = {
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        latitudeDelta: zoom,
        longitudeDelta: zoom,
      };
      setMapRegion(region);
    }

    setCurrentPosition(null);
    setHeading(0);
    setNavRoute([]);
    setIsNavigating(false);
  };


  useEffect(() => {
    if (isNavigating && currentPosition) {
      mapRef.current?.animateCamera(
        {
          center: currentPosition,
          heading,
          pitch: NAV_PITCH,
          zoom: 18,
        },
        { duration: 450 }
      );
    }
  }, [isNavigating, currentPosition, heading]);
  // ----------------

  // Centra el mapa en la ubicación del usuario al montar
  useEffect(() => {
    centerOnUser();
     return () => {
      if (locationWatcher) locationWatcher.remove();
    };
  }, []);

  // Centrar en la ubicación del usuario
  const centerOnUser = async () => {
    if (isNavigating) return;
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
    if (!mapRegion || isNavigating) return; // CAMERA_FIX
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
    if (!mapRegion || isNavigating) return; // CAMERA_FIX
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
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* Mapa */}
                <CustomMap
  ref={mapRef}
  region={isNavigating ? undefined : mapRegion} // CAMERA_FIX
  showsUserLocation={!isNavigating} // NAV3D hide blue dot in navigation
  followsUserLocation={!isNavigating}
  style={RNStyleSheet.absoluteFillObject}
  onPress={handleMapPress}
  showsCompass={false}
  showsMyLocationButton={false}
  theme={theme}
>
  {/* Marcadores manuales */}
  <MapMarkers markers={routeMarkers} />
  {route.length > 0 && (
    <Polyline
      // NAV3D prepend current location to route for immersive follow
      coordinates={isNavigating ? navRoute : route}
      strokeWidth={5}
      strokeColor="#1976D2"
    />
  )}

  {/* Marcadores automáticos (viaje asignado) */}
  <MapMarkers markers={autoRouteMarkers} />
  {autoRoute.length > 0 && (
    
    <Polyline
      // NAV3D auto route when navigating
      coordinates={isNavigating && currentPosition ? [currentPosition, ...autoRoute] : autoRoute}
      strokeWidth={5}
      strokeColor="#1976D2"
    />
  )}
  {isNavigating && currentPosition && (
    <Marker
      coordinate={currentPosition}
      flat
      anchor={{ x: 0.5, y: 0.5 }}
      rotation={heading}
      image={ArrowImg}
    />
  )}
</CustomMap>




      {/* Botón de menú 3 puntos arriba del zoom */}
      <TouchableOpacity style={[styles.menuButton, { backgroundColor: t.card }]} onPress={toggleTheme}>
        {theme === 'dark'
          ? <MaterialIcons name="wb-sunny" size={22} color={iconColor} />
          : <MaterialIcons name="nightlight-round" size={22} color={iconColor} />}
      </TouchableOpacity>



      {/* Esquina inferior derecha */}
      <View style={styles.rightButtons}>
        {isNavigating && (
          <TouchableOpacity
            style={[styles.stopNavBtn, { backgroundColor: t.card }]}
            onPress={stopNavigation}
          >
            <MaterialIcons name="close" size={24} color="red" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: t.card }]} onPress={zoomIn}>
          <FontAwesome6 name="add" size={24} color={t.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: t.card }]} onPress={zoomOut}>
          <FontAwesome6 name="minus" size={24} color={t.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: t.card }]} onPress={centerOnUser}>
          <MaterialIcons name="my-location" size={24} color={t.icon} />
        </TouchableOpacity>


        <TouchableOpacity
          style={[styles.truckBtn, { backgroundColor: t.card }]}
          onPress={() => {
            setShowRoutesSheet(true);
            setShowCreateTrip(false);
          }}>
          <Octicons name="package-dependents" size={18} color={t.text} style={{ marginRight: 8 }} />
          <Text style={[styles.truckText, { color: t.text }]}>Overview</Text>
        </TouchableOpacity>

        

      </View>

      {/* Esquina inferior izquierda */}
      <View style={styles.leftButtons}>
        <TouchableOpacity
          style={[styles.blueFab, { backgroundColor: t.blueFabBg }]}
          onPress={() => {
            setShowCreateTrip(true);
            setShowRoutesSheet(false);
          }}>
          <MaterialIcons name="share-location" size={48} color={t.blueFabIcon} />
        </TouchableOpacity>




        <TouchableOpacity style={[styles.historyBtn, { backgroundColor: t.card }]} onPress={handleRutaBtn}>
            <Ionicons name="reader" size={30} color={t.text} />
          </TouchableOpacity>

      </View>

      {!showCreateTrip && <FloatingSearchBar theme={theme} t={t} />}
      {showCreateTrip && (
        <CreateTripSheet
          driverId={user?.id}
          onClose={() => setShowCreateTrip(false)}
          onShowRoute={showAssignedRoute}
          onStartNavigation={startNavigation}
        />
      )}
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
    marginBottom: 10,
  },

  stopNavBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    shadowColor: "#000", shadowOpacity: 0.09, shadowRadius: 2, elevation: 2,
  },

  truckBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: 110,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    shadowColor: "#000", shadowOpacity: 0.09, shadowRadius: 2, elevation: 2,
    marginBottom: 10,
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
