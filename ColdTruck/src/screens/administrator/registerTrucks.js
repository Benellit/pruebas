import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const RegisterTrucksScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.containerTitle}>
                    <Text style={styles.title}> Register a New Truck</Text>
                </View>
                
                <View style={styles.containerImage}>
                    <Image
                        source={{uri: 'https://media.istockphoto.com/id/1445074332/es/foto/semirremolques-de-plataformas-grandes-y-coloridos-brillantes-con-semirremolques-parados-en-la.jpg?s=612x612&w=0&k=20&c=8H_zXHhDJ9CqXj_xGJ83n7hDmR5wXIQ54q6D2PDNwu4='}}
                        style={styles.imageMain}
                    />
                </View>
                <View style={{margin: 10, }}>
                    <TextInput
                        style={styles.input}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 15,
        height: '100%',
        backgroundColor: '#e3f6fd',
    },
    containerTitle: {
        marginHorizontal: 10,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#046bc8',
        borderRadius: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: 'white'
    },
    containerImage: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageMain: {
        height: 140,
        width: '95%',
        borderRadius: 20,
        elevation: 10,
    },
    input: {
        backgroundColor: '#ffffffcc',
        borderColor: '#046bc8',
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        width: '100%',
        marginBottom: 15,
        color: '#0E415C',
        fontSize: 15,
    },
});

export default RegisterTrucksScreen;
