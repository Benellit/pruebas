import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

import MyProfile from './MyProfile'; // Asegúrate de tener este componente
import UserManagement from './UserManagement'; // O pon tu contenido aquí mismo

const UsersScreen = () => {
  const { role } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Users'); // Controla cuál tab está activa

  return (
    <View style={styles.container}>
      {/* Barra de tabs superior interna */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={activeTab === 'Users' ? styles.tabActive : styles.tabInactive}
          onPress={() => setActiveTab('Users')}
        >
          <Text style={activeTab === 'Users' ? styles.tabTextActive : styles.tabTextInactive}>
            Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab === 'MyProfile' ? styles.tabActive : styles.tabInactive}
          onPress={() => setActiveTab('MyProfile')}
        >
          <Text style={activeTab === 'MyProfile' ? styles.tabTextActive : styles.tabTextInactive}>
            My Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido de cada "pantalla interna" */}
      <View style={styles.content}>
        {activeTab === 'Users' && (
          // Puedes importar y renderizar aquí tu lista de usuarios o gestión
          role === 'admin'
            ? <UserManagement />
            : <Text style={styles.text}>User Management</Text>
        )}
        {activeTab === 'MyProfile' && (
          // Componente de perfil de usuario
          <MyProfile />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FA' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingTop: 40,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E3E7ED',
    alignItems: 'flex-end',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderColor: '#1976D2',
    marginRight: 32,
    paddingBottom: 4,
  },
  tabInactive: {
    borderBottomWidth: 0,
    paddingBottom: 4,
    marginRight: 32,
  },
  tabTextActive: {
    fontSize: 20,
    color: '#232E3A',
    fontWeight: 'bold',
  },
  tabTextInactive: {
    fontSize: 20,
    color: '#B0B7C3',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  text: { fontSize: 20, color: '#232E3A', marginBottom: 10 },
});

export default UsersScreen;
