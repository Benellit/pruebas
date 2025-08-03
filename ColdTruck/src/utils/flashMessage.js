import { showMessage } from 'react-native-flash-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const iconMap = {
  success: { icon: 'check-circle', color: '#45d07e' },
  error: { icon: 'alert-circle', color: '#e74c3c' },
  warning: { icon: 'alert', color: '#f8d24c' },
  info: { icon: 'information', color: '#1a76fe' },
};

export function showTrackingMessage(type = 'info', message = '') {
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
      borderLeftWidth: 5,
      borderLeftColor: color,
      borderRadius: 13,
      shadowColor: '#111',
      shadowOpacity: 0.1,
      shadowRadius: 7,
      elevation: 2,
      alignItems: 'center',
      margin: 8,
      paddingVertical: 15,
    },
    duration: 3000,
    titleStyle: { fontWeight: 'bold', fontSize: 16 },
  });
}