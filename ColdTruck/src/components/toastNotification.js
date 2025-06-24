import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

const ToastNotification = ({ isVisible, message, type, onClose }) => {
    return (
        <Modal isVisible={isVisible} animationIn="slideInDown" animationOut="slideOutUp" backdropOpacity={0} style={styles.modalStyle}>
            <View style={[styles.toastContainer, type === "success" ? styles.success : styles.error]}>
                <AntDesign name={type === "success" ? "checkcircleo" : "closecircleo"} size={20} color={type === "success" ? "black" : "black"} style={styles.icon} />
                <View style={styles.textContainer}>
                    <Text style={[styles.title, type === "success" ? styles.successText : styles.errorText]}>{type === "success" ? "Success" : "Error"}</Text>
                    <Text style={styles.message}>{message}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <AntDesign name="close" size={16} color="#000" />
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const SuccessToast = ({ isVisible, message, onClose }) => (
    <ToastNotification isVisible={isVisible} message={message} type="success" onClose={onClose} />
);

const ErrorToast = ({ isVisible, message, onClose }) => (
    <ToastNotification isVisible={isVisible} message={message} type="error" onClose={onClose} />
);

const styles = StyleSheet.create({
    modalStyle: {
        justifyContent: "flex-start",
        margin: 10,
    },
    toastContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 20,
        marginTop: 40,
    },
    success: {
        backgroundColor: "#d4edda",
    },
    error: {
        backgroundColor: "#f8d7da",
    },
    icon: {
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
    },
    successText: {
        color: "black",
    },
    errorText: {
        color: "black",
    },
    message: {
        fontSize: 14,
        color: "black",
    },
    closeButton: {
        padding: 5,
    },
});

export { ErrorToast, SuccessToast };