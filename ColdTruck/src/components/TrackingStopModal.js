import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TrackingStopModal({ visible, onConfirm, onCancel }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="alert-outline" size={48} color="#F8D24C" style={{ marginBottom: 12 }} />
          <Text style={styles.title}>¿Detener navegación?</Text>
          <Text style={styles.subtitle}>Si cierras, tu ubicación dejará de enviarse.</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
              <Text style={[styles.btnText, { color: '#555' }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.confirmBtn]} onPress={onConfirm}>
              <Text style={[styles.btnText, { color: '#fff' }]}>Detener</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex:1, backgroundColor:'rgba(44,54,66,0.17)', justifyContent:'center', alignItems:'center' },
  card: { backgroundColor:'#fff', borderRadius:18, alignItems:'center', padding:28, width:'85%' },
  title: { fontSize:21, fontWeight:'bold', color:'#222', marginBottom:8 },
  subtitle: { fontSize:15, color:'#777', marginBottom:23, textAlign:'center' },
  btnRow: { flexDirection:'row', gap:12, width:'100%', justifyContent:'center' },
  btn: { flex:1, borderRadius:10, alignItems:'center', paddingVertical:12, marginHorizontal:2 },
  cancelBtn: { backgroundColor:'#eef1f5' },
  confirmBtn: { backgroundColor:'#e74c3c' },
  btnText: { fontWeight:'bold', fontSize:16, letterSpacing:0.5 },
});