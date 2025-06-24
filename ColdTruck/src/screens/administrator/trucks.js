import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AdminTrucksScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={loading} />
                }
            >
                <Text style={styles.title}>Trucks Admins</Text>
            </ScrollView>

            <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('registerTrucks', { role: 'Administrator' })}>
                <AntDesign name="plus" size={28} color="white" />
            </TouchableOpacity>
        </View>
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
    floatingButton: {
        position: "absolute",
        bottom: 20,
        right: 10,
        backgroundColor: "#046bc8",
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
        zIndex: 10,
    },
});

export default AdminTrucksScreen;
