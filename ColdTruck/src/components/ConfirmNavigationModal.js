import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const ConfirmNavigationModal = ({ visible, onCancel, onConfirm, loading }) => {
  return (
    <Modal isVisible={visible} backdropOpacity={0.4} animationIn="zoomIn" animationOut="zoomOut" useNativeDriver={true} hideModalContentWhileAnimating={true}>
      <View style={styles.container}>
        <MaterialCommunityIcons name="alert-circle" size={48} color="#F8D24C" style={styles.icon} />
        <Text style={styles.title}>Finalizar modo navegación</Text>
        <Text style={styles.subtitle}>
          ¿Seguro que deseas detener el seguimiento? No se enviarán más actualizaciones de tu ubicación.
        </Text>
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, loading && styles.disabledButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={[styles.cancelText, loading && styles.disabledText]}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton, loading && styles.disabledButton]}
            onPress={onConfirm}
            disabled={loading}
          >
            <Text style={styles.confirmText}>Finalizar seguimiento</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: "#D32F2F",
    marginLeft: 8,
  },
  cancelText: {
    color: "#666",
    fontWeight: "bold",
  },
  confirmText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    color: "#999",
  },
});

export default ConfirmNavigationModal;