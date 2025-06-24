import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';

const AdminHomeScreen = () => {
    const [loading, setLoading] = useState(false);
    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={loading} />
            }
        >
            <Text style={styles.title}>Home Admins</Text>
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
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#046bc8'
    },
});

export default AdminHomeScreen;
