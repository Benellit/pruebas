// src/screens/shared/mapStyles.js
import { Dimensions, StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  buttons: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderRadius: 25,
    paddingVertical: 10,
  },
  btnReset: {
    backgroundColor: '#d9534f',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCreate: {
    backgroundColor: '#0275d8',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnNav: {
    backgroundColor: '#5cb85c',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnNavActive: {
    backgroundColor: '#f0ad4e',
  },
  navigationArrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 5,
  },
  navigationInfo: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  navigationText: {
    color: 'white',
    fontSize: 16,
    marginVertical: 2,
  },
});
