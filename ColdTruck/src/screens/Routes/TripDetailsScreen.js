import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { fetchTrip } from '../../services/tripService';
import { reverseGeocodeOSM } from '../../services/geocodeService';
import { formatShortDate } from '../../utils/dateUtils';

export default function TripDetailsScreen({ route }) {
  const { tripId, trip: initialTrip } = route.params || {};
  const [trip, setTrip] = useState(initialTrip || null);
  const [loading, setLoading] = useState(!initialTrip);
  const [addresses, setAddresses] = useState({ origin: '', destination: '' });

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!tripId || initialTrip) return;
      setLoading(true);
      try {
        const data = await fetchTrip(tripId);
        if (mounted) setTrip(data);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [tripId]);

  useEffect(() => {
    let mounted = true;
    async function geocode() {
      if (!trip?.rute) return;
      const [orig, dest] = await Promise.all([
        trip.rute?.origin?.coordinates ? reverseGeocodeOSM(trip.rute.origin.coordinates) : { display_name: '' },
        trip.rute?.destination?.coordinates ? reverseGeocodeOSM(trip.rute.destination.coordinates) : { display_name: '' },
      ]);
      if (mounted) {
        setAddresses({ origin: orig.display_name, destination: dest.display_name });
      }
    }
    geocode();
    return () => {
      mounted = false;
    };
  }, [trip]);

  if (loading || !trip) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Origen</Text>
      <Text style={styles.text}>{addresses.origin}</Text>
      <Text style={styles.label}>Destino</Text>
      <Text style={styles.text}>{addresses.destination}</Text>
      <Text style={styles.label}>Fecha de salida</Text>
      <Text style={styles.text}>{formatShortDate(trip.scheduledDepartureDate)}</Text>
      <Text style={styles.label}>Estado</Text>
      <Text style={styles.text}>{trip.status}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20 },
  label: { fontWeight: 'bold', fontSize: 16, marginTop: 12 },
  text: { fontSize: 16, marginTop: 4 },
});