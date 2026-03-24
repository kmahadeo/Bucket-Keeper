import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface AnimatedGradientBackgroundProps {
  colors?: string[];
  children?: React.ReactNode;
}

export const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
  colors = [Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd],
  children,
}) => {
  const animation1 = useRef(new Animated.Value(0)).current;
  const animation2 = useRef(new Animated.Value(0)).current;
  const animation3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(animation1, 8000);
    animate(animation2, 12000);
    animate(animation3, 10000);
  }, []);

  const translateY1 = animation1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const translateX2 = animation2.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 30],
  });

  const scale3 = animation3.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <View style={styles.container}>
      {/* Base dark background */}
      <View style={[styles.absolute, { backgroundColor: Colors.backgroundDeep }]} />
      
      {/* Animated gradient orbs */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          { transform: [{ translateY: translateY1 }] },
        ]}
      >
        <LinearGradient
          colors={[colors[0] + '40', colors[0] + '00']}
          style={styles.orbGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          { transform: [{ translateX: translateX2 }] },
        ]}
      >
        <LinearGradient
          colors={[colors[1] + '30', colors[1] + '00']}
          style={styles.orbGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.orb,
          styles.orb3,
          { transform: [{ scale: scale3 }] },
        ]}
      >
        <LinearGradient
          colors={[colors[2] + '25', colors[2] + '00']}
          style={styles.orbGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDeep,
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  orb1: {
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.5,
    left: -width * 0.25,
  },
  orb2: {
    width: width * 1.2,
    height: width * 1.2,
    bottom: -width * 0.3,
    right: -width * 0.4,
  },
  orb3: {
    width: width,
    height: width,
    top: height * 0.3,
    left: -width * 0.2,
  },
});
