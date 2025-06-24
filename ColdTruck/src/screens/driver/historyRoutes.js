import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';

const HistoryDriverScreen = () => {
    const [loading, setLoading] = useState(false);
    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={loading} />
            }
        >
            <Text>History of Driver</Text>
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

export default HistoryDriverScreen;
