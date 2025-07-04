import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const NotificationsScreen = () => {
  const { role } = useContext(AuthContext);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notifications Screen - {role}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20 },
});

export default NotificationsScreen;