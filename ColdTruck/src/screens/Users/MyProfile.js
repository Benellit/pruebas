import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const MyProfile = () => {
  const { user, signOut } = useContext(AuthContext);

  const fullName = user
    ? `${user.name || ''} ${user.lastName || ''} ${user.secondLastName || ''}`
    : '';

  // Formatear la fecha
  const dateObj = user?.registrationDate ? new Date(user.registrationDate) : null;
  const formattedDate = dateObj
    ? `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`
    : '';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Cabecera */}
        <View style={styles.header}>
          <Image
            source={
              user?.profilePicture
                ? { uri: user.profilePicture }
                : { uri: 'https://ui-avatars.com/api/?name=User&background=E3E7ED&color=232E3A&size=128' }
            }
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>
              {user ? fullName : '---'}
            </Text>
            <View style={styles.roleTag}>
              <Text style={styles.roleText}>
                {user?.role === 'admin'
                  ? 'Administrator'
                  : user?.role === 'driver'
                  ? 'Driver'
                  : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Info, solo si hay usuario */}
        {user ? (
          <View style={styles.infoBox}>
            <InfoItem label="Full Name" value={fullName} />
            <InfoItem label="Email" value={user.email || ''} />
            <InfoItem label="Phone Number" value={user.phoneNumber || ''} />
            {user.role === 'driver' && user.license && (
              <InfoItem
                label="Driver License"
                value="See document"
                isLink
                link={user.license}
              />
            )}
            <InfoItem label="Registration Date" value={formattedDate} />
            <InfoItem label="Status" value={user.status || ''} />
            <InfoItem
              label="Role"
              value={user.role === 'admin' ? 'Administrator' : 'Driver'}
            />
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <Text style={styles.noDataText}>No user data :c</Text>
          </View>
        )}

        {/* Botón de Logout (siempre visible) */}
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const InfoItem = ({ label, value, isLink, link }) => (
  <View style={styles.itemRow}>
    <Text style={styles.itemLabel}>{label}</Text>
    {isLink ? (
      <TouchableOpacity
        onPress={() => {
          if (link) {
            Linking.openURL(link).catch(() =>
              Alert.alert('Error', 'Cannot open link')
            );
          }
        }}
      >
        <Text style={styles.linkText}>{value}</Text>
      </TouchableOpacity>
    ) : (
      <Text style={styles.itemValue}>{value}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  noDataText: {
    fontSize: 18,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  content: {
    padding: 5,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 40,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 50,
    marginRight: 18,
    backgroundColor: '#E3E7ED',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#232E3A',
  },
  roleTag: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#E3F0FF',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  roleText: {
    color: '#1976D2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#E3E7ED',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 7,
    elevation: 4,
    marginBottom: 28,
    marginTop: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E7ED',
  },
  itemLabel: {
    fontSize: 15,
    color: '#7B8CA6',
    fontWeight: '600',
  },
  itemValue: {
    fontSize: 15,
    color: '#232E3A',
    maxWidth: '60%',
    textAlign: 'right',
  },
  linkText: {
    fontSize: 15,
    color: '#1976D2',
    textDecorationLine: 'underline',
    maxWidth: '60%',
    textAlign: 'right',
  },
  logoutButton: {
    marginTop: 25,
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default MyProfile;
