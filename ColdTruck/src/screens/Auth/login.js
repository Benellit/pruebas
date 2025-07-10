import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { conexion } from '../../../conexion';

const LoginScreen = () => {
  const { signIn } = useContext(AuthContext);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      alert('Por favor ingresa email y contraseña');
      return;
    }

    try {
      const response = await fetch(`${conexion}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const usuario = data.user;
        await signIn(usuario); // Cambia el contexto y navega automáticamente
        setForm({ email: '', password: '' });
      } else {
        alert(data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      alert('Error de red o servidor');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../images/logoCold2.jpg')} style={styles.logo} />

      <Text style={styles.brandTitle}>ColdTruck</Text>
      <Text style={styles.slogan}>
        Refrigerated trailer transport monitoring and management system
      </Text>

      <View style={{ width: '100%' }}>
        <Text style={styles.inputLabel}>Email address</Text>
        <TextInput
          style={styles.input}
          placeholder="ColdTruck@gmail.com"
          placeholderTextColor="#1B5574"
          onChangeText={(email) => setForm({ ...form, email })}
          value={form.email}
        />
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor="#1B5574"
          secureTextEntry
          onChangeText={(password) => setForm({ ...form, password })}
          value={form.password}
        />
      </View>

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>Sign In</Text>
      </TouchableOpacity>

      {/* Botones para pruebas rápidas, puedes eliminarlos en producción */}
      <TouchableOpacity onPress={() => signIn({ role: 'Driver' })}>
        <Text style={styles.linkText}>Enter as Driver</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => signIn({ role: 'Administrator' })}>
        <Text style={styles.linkText}>Enter as Administrator</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e3f6fd',
    alignItems: 'center',
    paddingTop: 100,
    padding: 20,
    height: '100%',
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#046bc8',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#046bc8',
    marginBottom: 4,
    textAlign: 'center',
  },
  slogan: {
    fontSize: 14,
    color: '#046bc8',
    marginBottom: 10,
    textAlign: 'center',
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
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
    justifyContent: 'start',
  },
  loginBtn: {
    backgroundColor: '#046bc8',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginTop: 0,
  },
  loginText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#046bc8',
    fontSize: 16,
    marginTop: 10,
  },
});

export default LoginScreen;
