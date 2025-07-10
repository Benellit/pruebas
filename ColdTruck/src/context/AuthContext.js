import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({
  user: null,
  role: null,
  isAuthenticated: false,
  signIn: () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const userData = JSON.parse(data);
          setUser(userData);
          setRole(userData.role === 'Administrator' ? 'admin' : 'driver');
          setAuthenticated(true);
        }
      } catch (e) {
        console.error('Error loading user from AsyncStorage', e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const signIn = async (userData) => {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setRole(userData.role === 'Administrator' ? 'admin' : 'driver');
    setAuthenticated(true);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userData');
    setUser(null);
    setRole(null);
    setAuthenticated(false);
  };

  // Puedes usar loading para mostrar splash/loading mientras verifica el usuario
  if (loading) {
    return null; // o tu componente <SplashScreen />
  }

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
