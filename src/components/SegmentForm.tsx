import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { WheelSegmentData } from '../utils/wheelMath';

const PRESET_COLORS = ['#7DD3FC', '#A7F3D0', '#FDE68A', '#FBCFE8', '#DDD6FE', '#BBF7D0', '#FED7AA', '#C7D2FE'];

type Draft = {
  id: string;
  label: string;
  rewardValue: string;
  color: string;
};

type Props = {
  initial?: WheelSegmentData;
  onSubmit: (segment: WheelSegmentData) => void;
  submitLabel: string;
};

export default function SegmentForm({ initial, onSubmit, submitLabel }: Props) {
  const [label, setLabel] = useState(initial?.label ?? '');
  const [rewardValue, setRewardValue] = useState(String(initial?.rewardValue ?? 0));
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0]);

  const isValid = useMemo(() => {
    return label.trim().length > 0 && color.trim().length > 0 && rewardValue.trim().length > 0;
  }, [color, label, rewardValue]);

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }

    const seg: WheelSegmentData = {
      id: initial?.id ?? String(Date.now()),
      label: label.trim(),
      color,
      rewardValue: Number(rewardValue),
    };

    onSubmit(seg);
  };

  const draft: Draft = {
    id: initial?.id ?? '',
    label,
    rewardValue,
    color,
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{initial ? 'Sửa phần thưởng' : 'Thêm phần thưởng'}</Text>

      <Text style={styles.label}>Tên</Text>
      <TextInput
        value={draft.label}
        onChangeText={setLabel}
        placeholder="Ví dụ: Giải lớn"
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />

      <Text style={styles.label}>Giá trị thưởng</Text>
      <TextInput
        value={draft.rewardValue}
        onChangeText={setRewardValue}
        keyboardType="numeric"
        placeholder="Ví dụ: 100"
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />

      <Text style={styles.label}>Màu</Text>
      <View style={styles.colorRow}>
        {PRESET_COLORS.map(c => {
          const active = c.toLowerCase() === draft.color.toLowerCase();
          return (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[styles.colorSwatch, { backgroundColor: c }, active && styles.colorSwatchActive]}
            />
          );
        })}
      </View>

      <Pressable onPress={handleSubmit} style={[styles.submit, !isValid && styles.submitDisabled]}>
        <Text style={styles.submitText}>{submitLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
  label: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#94A3B8',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  colorSwatchActive: {
    borderColor: '#0F172A',
  },
  submit: {
    marginTop: 4,
    backgroundColor: '#A7F3D0',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#0F172A',
    fontWeight: '900',
  },
});
