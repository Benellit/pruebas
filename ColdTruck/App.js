// App.js :c

import React, { useContext } from 'react';
import { Image, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Auth screens
import LoginScreen from './src/screens/Auth/login';
import RegisterScreen from './src/screens/Auth/register';

// Main screens
import HomeScreen from './src/screens/Home/HomeScreen';
import RoutesScreen from './src/screens/Routes/RoutesScreen';
import TrucksScreen from './src/screens/Trucks/TrucksScreen';
import NotificationsScreen from './src/screens/Notifications/NotificationsScreen';
import UsersScreen from './src/screens/Users/UsersScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppTabs = () => {
  const { role } = useContext(AuthContext);
  const scheme = useColorScheme();
  const defaultBg = scheme === 'dark' ? '#1b263b' : '#fff';
  const defaultActive = scheme === 'dark' ? '#fff' : '#046bc8';
  return (
    <Tab.Navigator
      initialRouteName="Routes"
      screenOptions={({ route }) => ({
        headerShown: false,
       tabBarActiveTintColor: defaultActive,
        tabBarInactiveTintColor: defaultActive,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          if (route.name === 'Routes') iconName = focused ? 'map' : 'map-outline';
          if (route.name === 'Trucks') iconName = focused ? 'bus' : 'bus-outline';
          if (route.name === 'Notifications') iconName = focused ? 'notifications' : 'notifications-outline';
          if (route.name === 'Users') iconName = focused ? 'people' : 'people-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: { height: 70, backgroundColor: defaultBg },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} initialParams={{ role }} />
      <Tab.Screen name="Routes" component={RoutesScreen} initialParams={{ role }} />
      <Tab.Screen name="Trucks" component={TrucksScreen} initialParams={{ role }} />
      <Tab.Screen name="Users" component={UsersScreen} initialParams={{ role }} />
    </Tab.Navigator>
  );
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <AppTabs /> : <AuthStack />;
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({});