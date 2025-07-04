import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({
  role: null,
  isAuthenticated: false,
  signIn: () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const user = JSON.parse(data);
        setRole(user.role === 'Administrator' ? 'admin' : 'driver');
        setAuthenticated(true);
      }
    };
    loadUser();
  }, []);

  const signIn = async (user) => {
    await AsyncStorage.setItem('userData', JSON.stringify(user));
    setRole(user.role === 'Administrator' ? 'admin' : 'driver');
    setAuthenticated(true);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userData');
    setRole(null);
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ role, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};