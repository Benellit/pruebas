// src/utils/mapStyles.js
export const darkMapStyle = [  {
    elementType: 'geometry',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8ec3b9' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1a3646' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  // Puedes incluir más estilos aquí si lo deseas.
];

export const lightMapStyle = [];

// Para compatibilidad con imports existentes
export const mapStyle = darkMapStyle;