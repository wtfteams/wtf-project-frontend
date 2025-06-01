import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';


interface LoadingDotsProps {
  size?: number;
  color?: string;
  animationDuration?: number;
  dotSpacing?: number;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 8,
  color = '#FF0000',
  animationDuration = 600,
  dotSpacing = 8,
}) => {
  const dot1TranslateY = useRef(new Animated.Value(0)).current;
  const dot2TranslateY = useRef(new Animated.Value(0)).current;
  const dot3TranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const waveAmplitude = size * 0.2;

    const createDotAnimation = (value: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: -waveAmplitude,
            duration: animationDuration / 2,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: waveAmplitude,
            duration: animationDuration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: animationDuration / 2,
            useNativeDriver: true,
          })
        ])
      );
    };

    // Create animations with different delays for each dot
    const animations = [
      createDotAnimation(dot1TranslateY, 0),
      createDotAnimation(dot2TranslateY, animationDuration / 3),
      createDotAnimation(dot3TranslateY, (animationDuration / 3) * 2)
    ];

    // Start all animations
    animations.forEach(animation => animation.start());

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, [size, animationDuration]);

  const dotStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    marginHorizontal: dotSpacing / 2,
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          dotStyle,
          {
            transform: [{ translateY: dot1TranslateY }],
          },
        ]}
      />
      <Animated.View
        style={[
          dotStyle,
          {
            transform: [{ translateY: dot2TranslateY }],
          },
        ]}
      />
      <Animated.View
        style={[
          dotStyle,
          {
            transform: [{ translateY: dot3TranslateY }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24, // Added fixed height for better visibility
    paddingVertical: 8, // Added padding for animation space
  },
});

export default LoadingDots;