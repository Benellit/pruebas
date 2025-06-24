import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';

const ProfileScreen = () => {
    const [loading, setLoading] = useState(false);
    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={loading} />
            }
        >
            <Text style={styles.title}>Profile</Text>
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
        color: '#0E415C'
    },
});

export default ProfileScreen;