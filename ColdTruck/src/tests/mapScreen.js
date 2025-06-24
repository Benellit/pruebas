import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const apiKey = '5b3ce3597851110001cf62486b568c6b7213474cb53c4d52de715431';

export default function MapScreen() {
  const [markers, setMarkers] = useState([]);
  const [route, setRoute] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [heading, setHeading] = useState(0);
  const [navigationMode, setNavigationMode] = useState(false);
  const mapRef = useRef(null);

  // Estilo de mapa para navegación (modo oscuro)
  const mapStyle = [
    {
      "elementType": "geometry",
      "stylers": [{ "color": "#1d2c4d" }]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#8ec3b9" }]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#1a3646" }]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "administrative.country",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#4b6878" }]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#64779e" }]
    },
    {
      "featureType": "poi",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry.fill",
      "stylers": [{ "color": "#023e58" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#3C7680" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{ "color": "#304a7d" }]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#98a5be" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{ "color": "#2c6675" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#255763" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#b0d5ce" }]
    },
    {
      "featureType": "transit",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#0e1626" }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#4e6d70" }]
    }
  ];

  // Permisos y ubicación en tiempo real
  useEffect(() => {
    let subscriber;
    let magnetometerSub;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso denegado');
        return;
      }

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 5,
        },
        (loc) => {
          setLocation(loc.coords);
          if (navigationMode && mapRef.current) {
            mapRef.current.animateCamera({
              center: {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              },
              heading: heading,
              pitch: 45,
              zoom: 18,
            });
          }
        }
      );

      // Configurar brújula para navegación
      magnetometerSub = Magnetometer.addListener((data) => {
        const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        setHeading(angle);
      });
      Magnetometer.setUpdateInterval(100);
    })();

    return () => {
      if (subscriber) subscriber.remove();
      if (magnetometerSub) magnetometerSub.remove();
    };
  }, [navigationMode]);

  const handleMapPress = (event) => {
    if (markers.length < 2) {
      setMarkers([...markers, event.nativeEvent.coordinate]);
    }
  };

  const resetMap = () => {
    setMarkers([]);
    setRoute([]);
    setRouteData(null);
    setNavigationMode(false);
  };

  const getRouteFromAPI = async (start, end) => {
    try {
      const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [
            [start.longitude, start.latitude],
            [end.longitude, end.latitude],
          ],
          instructions: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const routeCoords = data.features[0].geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0],
      }));

      setRoute(routeCoords);
      setRouteData(data);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCreateRoute = () => {
    if (markers.length < 2) {
      Alert.alert('Selecciona 2 puntos en el mapa');
      return;
    }
    getRouteFromAPI(markers[0], markers[1]);
  };

  const toggleNavigationMode = () => {
    if (route.length === 0) {
      Alert.alert('Primero crea una ruta');
      return;
    }
    setNavigationMode(!navigationMode);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 32.5222,
          longitude: -117.0192,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
        showsUserLocation={true}
        followsUserLocation={true}
        showsCompass={true}
        showsTraffic={true}
        showsBuildings={true}
        customMapStyle={mapStyle}
        rotateEnabled={!navigationMode}
        pitchEnabled={!navigationMode}
        scrollEnabled={!navigationMode}
        zoomEnabled={!navigationMode}
        toolbarEnabled={!navigationMode}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker}
            title={`Punto ${index + 1}`}
            pinColor={index === 0 ? '#4CAF50' : '#F44336'}
          />
        ))}

        {route.length > 0 && (
          <Polyline 
            coordinates={route} 
            strokeColor="#4CAF50" 
            strokeWidth={6}
            lineDashPattern={[1]}
          />
        )}

        {location && navigationMode && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            rotation={heading}
          >
            <View style={styles.navigationArrow}>
              <MaterialIcons name="navigation" size={32} color="#0275d8" />
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.buttons}>
        <TouchableOpacity onPress={resetMap} style={styles.btnReset}>
          <MaterialIcons name="delete" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCreateRoute} style={styles.btnCreate}>
          <MaterialIcons name="alt-route" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={toggleNavigationMode} 
          style={[styles.btnNav, navigationMode && styles.btnNavActive]}
        >
          <MaterialIcons name="navigation" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {navigationMode && (
        <View style={styles.navigationInfo}>
          <Text style={styles.navigationText}>Modo Navegación Activado</Text>
          <Text style={styles.navigationText}>Mantén el dispositivo en posición vertical</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  buttons: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderRadius: 25,
    paddingVertical: 10,
  },
  btnReset: {
    backgroundColor: '#d9534f',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCreate: {
    backgroundColor: '#0275d8',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnNav: {
    backgroundColor: '#5cb85c',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnNavActive: {
    backgroundColor: '#f0ad4e',
  },
  navigationArrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 5,
  },
  navigationInfo: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  navigationText: {
    color: 'white',
    fontSize: 16,
    marginVertical: 2,
  },
});