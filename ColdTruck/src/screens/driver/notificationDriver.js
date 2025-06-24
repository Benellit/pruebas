import { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

const NotificationDriverScreen = () => {
    const [loading, setLoading] = useState(false);
    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={loading} />
            }
        >
            <Text>Notifications of Driver</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 30,
        height: '100%',
        backgroundColor: '#e3f6fd',
    },
});

export default NotificationDriverScreen;
