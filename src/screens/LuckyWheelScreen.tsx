import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import SoundPlayer from 'react-native-sound-player';

import LuckyWheel from '../components/LuckyWheel';
import ResultModal from '../components/ResultModal';
import SpinButton from '../components/SpinButton';
import type { WheelSegmentData } from '../utils/wheelMath';
import { getSpinToIndexDeltaDeg, pickRandomIndex } from '../utils/wheelMath';

type Props = {
  segments: WheelSegmentData[];
};

export default function LuckyWheelScreen({ segments }: Props) {
  const rotation = useRef(new Animated.Value(0)).current;
  const currentRotationDegRef = useRef(0);

  const [wheelSize, setWheelSize] = useState(280);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WheelSegmentData | null>(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const rotationInterpolate = useMemo(() => {
    return rotation.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
      extrapolate: 'extend',
    });
  }, [rotation]);

  const onWheelLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    const next = Math.min(w, 360);
    setWheelSize(Math.max(240, next));
  }, []);

  const handleSpin = useCallback(() => {
    if (spinning || segments.length < 2) {
      return;
    }

    // Randomize reward index BEFORE animation.
    const selectedIndex = pickRandomIndex(segments.length);
    const selected = segments[selectedIndex];

    setSpinning(true);

    const fullRotations = 4;
    const deltaDeg = getSpinToIndexDeltaDeg({
      selectedIndex,
      segmentCount: segments.length,
      fullRotations,
      currentRotationDeg: currentRotationDegRef.current,
    });

    const nextRotation = currentRotationDegRef.current + deltaDeg;

    Animated.timing(rotation, {
      toValue: nextRotation,
      duration: 4200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      currentRotationDegRef.current = nextRotation;
      setConfettiKey(k => k + 1);
      try {
        // Place file at: android/app/src/main/res/raw/success.mp3
        SoundPlayer.playSoundFile('success', 'mp3');
      } catch {
        // Ignore if missing
      }
      setResult(selected);
      setResultVisible(true);
      setSpinning(false);
    });
  }, [rotation, segments, spinning]);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Vòng quay may mắn</Text>
      <Text style={styles.subtitle}>Nhấn QUAY để nhận thưởng</Text>

      <View style={styles.wheelCard} onLayout={onWheelLayout}>
        <LuckyWheel segments={segments} size={wheelSize} rotationDeg={rotationInterpolate} />
      </View>

      <View style={styles.bottom}>
        <SpinButton onPress={handleSpin} disabled={segments.length < 2} loading={spinning} />
        <Text style={styles.hint}>Bạn có thể tuỳ chỉnh vòng quay trong tab Tuỳ chỉnh.</Text>
      </View>

      <ResultModal
        visible={resultVisible}
        result={result}
        onClose={() => {
          setResultVisible(false);
          setResult(null);
        }}
      />

      {resultVisible ? (
        <ConfettiCannon key={confettiKey} count={90} origin={{ x: 180, y: 0 }} fadeOut />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 6,
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  wheelCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#93C5FD',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    flex: 1,
  },
  bottom: {
    gap: 10,
  },
  hint: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
