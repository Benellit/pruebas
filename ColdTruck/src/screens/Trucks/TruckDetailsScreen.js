import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { fetchTripsForTruck } from '../../services/tripService';

const TruckDetailsScreen = ({ route }) => {
  const { truckId } = route.params;
  const [activeTab, setActiveTab] = useState('General');
  const [truck, setTruck] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { truck: truckData, alerts: alertsData } = await fetchTripsForTruck(
          truckId,
        );
        setTruck(truckData);
        setAlerts(alertsData);
      } catch (err) {
        console.error('Error cargando datos del camión', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [truckId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!truck) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No data</Text>
      </View>
    );
  }

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

      {activeTab === 'General' && (
        <View style={{ padding: 16 }}>
          <Text>Plates: {truck.plates}</Text>
          <Text>Status: {truck.status}</Text>
          <Text>
            Brand: {truck.brand?.name ?? truck.IDBrand?.name ?? truck.IDBrand}
          </Text>
          <Text>
            Model: {truck.model?.name ?? truck.IDModel?.name ?? truck.IDModel}
          </Text>
          <Text>
            Cargo Type:
            {truck.cargoType?.name ?? truck.IDCargoType?.name ?? truck.IDCargoType}
          </Text>
          <Text>
            Admin:
            {truck.admin
              ? [truck.admin.name, truck.admin.lastName, truck.admin.secondLastName]
                  .filter(Boolean)
                  .join(' ')
              : truck.IDAdmin?.name
              ? [
                  truck.IDAdmin.name,
                  truck.IDAdmin.lastName,
                  truck.IDAdmin.secondLastName,
                ]
                  .filter(Boolean)
                  .join(' ')
              : truck.IDAdmin}
          </Text>
        </View>
      )}

      {activeTab === 'Alerts' && (
        alerts.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>No alerts found</Text>
          </View>
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={item => item._id.toString()}
            renderItem={({ item }) => (
              <View
                style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}
              >
                <Text>{item.type}</Text>
                <Text>{item.description}</Text>
                {item.value != null && (
                  <Text>
                    {item.value}
                    {item.valueLabel}
                  </Text>
                )}
                <Text>{new Date(item.dateTime).toLocaleString()}</Text>
                <Text>
                  Trip: {item.tripId} - {item.truckPlates}
                </Text>
              </View>
            )}
          />
        )
      )}
    </View>
  );
};

export default TruckDetailsScreen;