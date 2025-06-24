// App.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Pantallas
  // shared
import ProfileScreen from './src/screens/shared/profile';

  // driver
import AdminHomeScreen from './src/screens/administrator/home';
import HistoryDriverScreen from './src/screens/driver/historyRoutes';
import MainDriverScreen from './src/screens/driver/mainDriver';
import NotificationDriverScreen from './src/screens/driver/notificationDriver';
import RouteDriverScreen from './src/screens/driver/routeDriver';
import LoginScreen from './src/screens/loginYregister/login';
import RegisterScreen from './src/screens/loginYregister/register';

  // admin
import InsertRoutesScreen from './src/screens/administrator/insertRoutes';
import AdminNotificationsScreen from './src/screens/administrator/notifications';
import RegisterTrucksScreen from './src/screens/administrator/registerTrucks';
import AdminRoutesScreen from './src/screens/administrator/routes';
import AdminTrucksScreen from './src/screens/administrator/trucks';
import AdminDriverScreen from './src/screens/administrator/users';

  // test
import MapScreen from './src/tests/mapScreen';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


// Componente con las Tabs según el rol
const HomeTabs = ({ route }) => {
  const { role } = route.params;
  const navigation = useNavigation();

  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          setUsuario(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error al leer usuario:', error);
      }
    };

    fetchUser();
  }, []);

  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerTitle: '',
          headerRight: () => {
            return (
              <TouchableOpacity style={styles.userIcon} onPress={() => navigation.navigate("Profile")}>
                {usuario?.image ? (
                  <Image source={{ uri: usuario.image }} style={{height:40, width: 40}} />
                ) : (
                  <Ionicons name="person-circle-outline" size={40} color="white" />
                )}
              </TouchableOpacity>
            );
          },
          headerStyle: {
              backgroundColor: "#046bc8",
              height: 90,
          },
          tabBarActiveTintColor: '#046bc8',
          tabBarInactiveTintColor: '#046bc8',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
              //Driver
            if (route.name === 'Main') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Test') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else if (route.name === 'History') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Notification') {
              iconName = focused ? 'notifications' : 'notifications-outline';
            } else if (route.name === 'Route') {
              iconName = focused ? 'map' : 'map-outline';
              // Admin
            } else if (route.name === 'Users') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Routes') {
              iconName = focused ? 'map' : 'map-outline';
            } else if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Trucks') {
              iconName = focused ? 'bus' : 'bus-outline';
            } else if (route.name === 'Notifications') {
              iconName = focused ? 'notifications' : 'notifications-outline';
            } else if (route.name === 'Map') {
              iconName = focused ? 'map' : 'map-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarItemStyle: {
            alignItems: 'center',
            justifyContent: 'center',
            width: 50,
            margin: 5,
            padding: 5,
          },
          tabBarPressColor: 'transparent',
          tabBarPressOpacity: 1,
          tabBarStyle: {
            height: 110,
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
          },
        })}
      >
      {role === 'Administrator' && (
        <>
        <Tab.Screen name="Home" component={AdminHomeScreen} />
        <Tab.Screen name="Routes" component={AdminRoutesScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Users" component={AdminDriverScreen} />
        <Tab.Screen name="Trucks" component={AdminTrucksScreen} />
        <Tab.Screen name="Notifications" component={AdminNotificationsScreen} />
        </>
      )}
      {role === 'Driver' && (
        <>
          <Tab.Screen name='Main' component={MainDriverScreen}/>
          <Tab.Screen name='Route' component={RouteDriverScreen}/>
          <Tab.Screen name='History' component={HistoryDriverScreen}/>
          <Tab.Screen name='Notification' component={NotificationDriverScreen}/>
        </>
      )}
    </Tab.Navigator>
  );
};

export default function App() {
  return (// headerTitle: ''
    <NavigationContainer styles={styles.container}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="HomeTabs" component={HomeTabs}/>
        <Stack.Screen name="Profile" component={ProfileScreen}
          options={{
          headerShown: true,
          headerTitle: '',
          headerStyle: {
              backgroundColor: "#046bc8",
              height: 90,
          },
          headerTintColor: "#fff",
        }}/>
        <Stack.Screen name="insertRoutes" component={InsertRoutesScreen}
          options={{
          headerShown: true,
          headerTitle: '',
          headerStyle: {
              backgroundColor: "#046bc8",
              height: 90,
          },
          headerTintColor: "#fff",
        }}/>
        <Stack.Screen name="registerTrucks" component={RegisterTrucksScreen}
          options={{
          headerShown: true,
          headerTitle: '',
          headerStyle: {
              backgroundColor: "#046bc8",
              height: 90,
          },
          headerTintColor: "#fff",
        }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: "none",
  },
  userIcon: {
    paddingRight: 15,
  },
})