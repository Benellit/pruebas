import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const InsertRoutesScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.containerTitle}>
                    <Text style={styles.title}> Register a New Route</Text>
                </View>
                
                <View style={styles.containerImage}>
                    <Image
                        source={{uri: 'https://www.novatrans.es/wp-content/uploads/2020/11/optimizacion-de-rutas-de-transporte.png'}}
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

export default InsertRoutesScreen;
