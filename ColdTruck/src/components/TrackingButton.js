import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function TrackingButton({ trackingState, onPress, style }) {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let loop;
    if (trackingState === 'active') {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.delay(9000),
        ])
      );
      loop.start();
    } else if (trackingState === 'error') {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ])
      );
      loop.start();
    } else {
      anim.setValue(1);
    }
    return () => loop && loop.stop();
  }, [trackingState, anim]);

  const colorMap = {
    inactive: '#000',
    active: '#38b5c5ff',
    error: '#e74c3c',
  };
  const color = colorMap[trackingState] || colorMap.inactive;

  const animatedStyle = {
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={trackingState === 'active'} style={style}>
      <Animated.View style={trackingState === 'inactive' ? null : animatedStyle}>
        <MaterialIcons name="my-location" size={28} color={color} />
      </Animated.View>
    </TouchableOpacity>
  );
}