import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { fetchTripsForTruck } from '../../services/tripService';
import { fetchTruck } from '../../services/truckService';

const TruckDetailsScreen = ({ route }) => {
  const { truckId } = route.params;
  const [activeTab, setActiveTab] = useState('General');
  const [truck, setTruck] = useState(null);
  const [trips, setTrips] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const { trips: tripsData, alerts: alertsData } = await fetchTripsForTruck(truckId);
        setTrips(tripsData);
        setAlerts(alertsData);
        const truckData = await fetchTruck(truckId);
        setTruck(truckData);
      } catch (err) {
        console.error('Error cargando datos del camión', err);
      }
    }
    load();
  }, [truckId]);

  const currentTrip = useMemo(() => {
    if (!trips.length) return null;
    const active = trips.find(t => t.status === 'OnTrip' || t.status === 'Active');
    if (active) return active;
    return [...trips].sort((a, b) => new Date(b.scheduledDepartureDate) - new Date(a.scheduledDepartureDate))[0];
  }, [trips]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={() => setActiveTab('General')}
          style={{ flex: 1, padding: 12, backgroundColor: activeTab === 'General' ? '#ccc' : '#eee' }}
        >
          <Text style={{ textAlign: 'center' }}>General</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('Alerts')}
          style={{ flex: 1, padding: 12, backgroundColor: activeTab === 'Alerts' ? '#ccc' : '#eee' }}
        >
          <Text style={{ textAlign: 'center' }}>Alerts</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'General' && truck && (
        <View style={{ padding: 16 }}>
          <Text>Plates: {truck.plates}</Text>
          <Text>Status: {currentTrip?.status || truck.status}</Text>
          <Text>Brand: {truck.brand?.name ?? truck.IDBrand}</Text>
          <Text>Model: {truck.model?.name ?? truck.IDModel}</Text>
          <Text>Admin: {truck.admin?.name ?? truck.IDAdmin}</Text>
        </View>
      )}

      {activeTab === 'Alerts' && (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
              <Text>{item.type}</Text>
              <Text>{item.description}</Text>
              <Text>
                {item.value}
                {item.valueLabel}
              </Text>
              <Text>{new Date(item.dateTime).toLocaleString()}</Text>
              <Text>
                Trip: {item.tripId} - {item.truckPlates}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default TruckDetailsScreen;