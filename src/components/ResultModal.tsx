import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { WheelSegmentData } from '../utils/wheelMath';

type Props = {
  visible: boolean;
  result: WheelSegmentData | null;
  onClose: () => void;
};

export default function ResultModal({ visible, result, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Kết quả</Text>
          <Text style={styles.label}>{result?.label ?? ''}</Text>
          <Text style={styles.value}>Phần thưởng: {result?.rewardValue ?? 0}</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Đồng ý</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#93C5FD',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  title: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },
  label: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  value: {
    marginTop: 8,
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#A7F3D0',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeText: {
    color: '#0F172A',
    fontWeight: '900',
  },
});
