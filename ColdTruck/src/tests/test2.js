import { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import conexion from '../../conexion';

const test2Screen = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');

    const obtenerUsuarios = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://${conexion}:3000/users`);
            const data = await res.json();
            setUsuarios(data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('❌ Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const insertarUsuario = async () => {
        if (username.trim() === '') {
            Alert.alert('Campo vacío', 'Por favor escribe un nombre de usuario');
            return;
        }

        try {
            const res = await fetch(`http://192.168.1.225:3000/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            const data = await res.json();

            if (res.ok) {
                Alert.alert('✅ Usuario agregado');
                setUsername('');
                obtenerUsuarios();
            } else {
                console.error(data);
                Alert.alert('Error', data.error || 'No se pudo crear el usuario');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error de conexión', 'No se pudo conectar al servidor');
        }
    };

    useEffect(() => {
        obtenerUsuarios();
    }, []);

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={obtenerUsuarios} />
            }
        >
            <Text style={styles.title}>ColdTruck</Text>
            <Text style={styles.subtitle}>Usuarios:</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            {usuarios.length === 0 && !loading ? (
                <Text>No hay usuarios</Text>
            ) : (
                usuarios.map((usuario, index) => (
                    <Text key={index} style={styles.user}>
                        👤 {usuario.username}
                    </Text>
                ))
            )}

            {/* Entrada de nuevo usuario */}
            <TextInput
                placeholder='Nombre de usuario'
                value={username}
                onChangeText={setUsername}
                style={{
                    marginTop: 20,
                    borderStyle: 'solid',
                    borderWidth: 0.5,
                    padding: 10,
                    fontSize: 18,
                }}
            />
            <TouchableOpacity
                onPress={insertarUsuario}
                style={{
                    backgroundColor: '#0b5394',
                    marginTop: 10,
                    padding: 15,
                    borderRadius: 20,
                }}
            >
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 18 }}>
                    Enviar
                </Text>
            </TouchableOpacity>
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
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#0E415C',
    },
    subtitle: {
        fontSize: 22,
        marginBottom: 10,
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
    user: {
        fontSize: 18,
        marginBottom: 5,
    },
});

export default test2Screen;
