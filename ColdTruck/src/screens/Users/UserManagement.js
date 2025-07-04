import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserManagement = () => (
  <View style={styles.container}>
    <Text style={styles.text}>User Management Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20 },
});

export default UserManagement;