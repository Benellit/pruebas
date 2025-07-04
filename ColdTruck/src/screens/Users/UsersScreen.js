import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const UsersScreen = () => {
  const { role } = useContext(AuthContext);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Profile</Text>
      {role === 'admin' && <Text style={styles.text}>User Management</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20, marginBottom: 10 },
});

export default UsersScreen;