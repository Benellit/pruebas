import { showMessage } from "react-native-flash-message";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export function showTrackingMessage(type = 'info', message = '') {
  const iconMap = {
    success: { icon: 'check-circle', color: '#38c57d' },
    error:   { icon: 'alert-circle', color: '#e74c3c' },
    warning: { icon: 'alert',        color: '#f8d24c' },
    info:    { icon: 'information',  color: '#1976D2' },
  };
  const { icon, color } = iconMap[type] || iconMap.info;
  showMessage({
    message,
    type,
    backgroundColor: '#fff',
    color: '#22304e',
    icon: props => (
      <MaterialCommunityIcons name={icon} size={22} color={color} style={{ marginRight: 8 }} />
    ),
    style: {
      borderLeftWidth: 6,
      borderLeftColor: color,
      borderRadius: 16,
      shadowColor: color,
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 3,
      alignItems: 'center',
      margin: 12,
      paddingVertical: 16,
      marginTop: 30,
    },
    duration: 4500,
    titleStyle: { fontWeight: 'bold', fontSize: 17 },
  });
}