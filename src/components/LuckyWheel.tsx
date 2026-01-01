import React, { useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import WheelSegment from './WheelSegment';
import type { WheelSegmentData } from '../utils/wheelMath';
import { getSweepAngleDeg, WHEEL_START_ANGLE_DEG } from '../utils/wheelMath';

type Props = {
  segments: WheelSegmentData[];
  size: number;
  rotationDeg: Animated.AnimatedInterpolation<string>;
};

export default function LuckyWheel({ segments, size, rotationDeg }: Props) {
  const radius = size / 2;
  const cx = radius;
  const cy = radius;

  const sweep = useMemo(() => getSweepAngleDeg(segments.length), [segments.length]);

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <View style={[styles.wheelShadow, { width: size, height: size, borderRadius: radius }]}>
        <Animated.View
          style={{
            transform: [
              {
                rotate: rotationDeg,
              },
            ],
          }}
        >
          <Svg width={size} height={size}>
            <Circle cx={cx} cy={cy} r={radius} fill="#FFFFFF" />
          {segments.map((s, i) => {
            const start = WHEEL_START_ANGLE_DEG + i * sweep;
            const end = WHEEL_START_ANGLE_DEG + (i + 1) * sweep;

            return (
              <WheelSegment
                key={s.id}
                cx={cx}
                cy={cy}
                radius={radius}
                startAngleDeg={start}
                endAngleDeg={end}
                fill={s.color}
                stroke="#FFFFFF"
                strokeWidth={3}
                label={s.label}
              />
            );
          })}
            <Circle cx={cx} cy={cy} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={3} />
            <Circle cx={cx} cy={cy} r={radius - 2} fill="none" stroke="#93C5FD" strokeWidth={2} opacity={0.45} />
            <Circle cx={cx} cy={cy} r={9} fill="#E2E8F0" />
          </Svg>
        </Animated.View>
      </View>

      <View pointerEvents="none" style={styles.pointer} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelShadow: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#93C5FD',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    overflow: 'hidden',
  },
  pointer: {
    position: 'absolute',
    top: -2,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#34D399',
    shadowColor: '#34D399',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
