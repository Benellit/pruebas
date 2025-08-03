import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function TrackingButton({ trackingState, onPress, style }) {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (trackingState === 'active') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 0.5, duration: 500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.delay(9000),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      anim.setValue(1);
    }
  }, [trackingState, anim]);

  let icon = 'my-location';
  let color = '#9ca1af';
  if (trackingState === 'active') {
    icon = 'navigation';
    color = '#38c57d';
  }
  if (trackingState === 'error') {
    icon = 'navigation';
    color = '#e74c3c';
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={trackingState === 'active'} style={style}>
      <Animated.View style={{ opacity: trackingState === 'active' ? anim : 1 }}>
        <MaterialIcons name={icon} size={32} color={color} />
      </Animated.View>
    </TouchableOpacity>
  );
}