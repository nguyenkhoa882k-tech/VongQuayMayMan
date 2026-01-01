import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import LuckyWheel from '../components/LuckyWheel';
import SegmentForm from '../components/SegmentForm';
import type { WheelSegmentData } from '../utils/wheelMath';
import { saveSegments } from '../utils/storage';

type Props = {
  initialSegments: WheelSegmentData[];
  onSaved: (segments: WheelSegmentData[]) => void;
};

export default function WheelEditorScreen({ initialSegments, onSaved }: Props) {
  const [segments, setSegments] = useState<WheelSegmentData[]>(initialSegments);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [section, setSection] = useState<'form' | 'list'>('form');

  const rotation = useRef(new Animated.Value(0)).current;
  const rotationInterpolate = useMemo(() => {
    return rotation.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
      extrapolate: 'extend',
    });
  }, [rotation]);

  const editingSegment = useMemo(() => {
    return segments.find(s => s.id === editingId) ?? null;
  }, [editingId, segments]);

  const handleAdd = useCallback(
    (seg: WheelSegmentData) => {
      setSegments(prev => [...prev, seg]);
    },
    [setSegments],
  );

  const handleEdit = useCallback(
    (seg: WheelSegmentData) => {
      setSegments(prev => prev.map(p => (p.id === seg.id ? seg : p)));
      setEditingId(null);
      setSection('form');
    },
    [setSegments],
  );

  const handleRemove = useCallback(
    (id: string) => {
      setSegments(prev => prev.filter(p => p.id !== id));
      if (editingId === id) {
        setEditingId(null);
      }
    },
    [editingId],
  );

  const canSave = useMemo(() => {
    if (segments.length < 2) {
      return false;
    }
    return segments.every(s => s.label.trim().length > 0);
  }, [segments]);

  const handleSave = useCallback(async () => {
    if (!canSave) {
      Alert.alert('Vòng quay chưa hợp lệ', 'Vui lòng có ít nhất 2 phần và không để trống tên.');
      return;
    }

    try {
      await saveSegments(segments);
      onSaved(segments);
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu vòng quay.');
    }
  }, [canSave, onSaved, segments]);

  const handleDeleteEditing = useCallback(() => {
    if (!editingSegment) {
      return;
    }

    Alert.alert('Xoá phần thưởng', 'Bạn có chắc muốn xoá phần này không?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: () => {
          handleRemove(editingSegment.id);
        },
      },
    ]);
  }, [editingSegment, handleRemove]);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Tuỳ chỉnh vòng quay</Text>

      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>Xem trước</Text>
        <View style={styles.previewWheel}>
          <LuckyWheel segments={segments} size={210} rotationDeg={rotationInterpolate} />
        </View>
      </View>

      <View style={styles.forms}>
        <View style={styles.innerTabs}>
          <Pressable
            onPress={() => setSection('form')}
            style={[styles.innerTab, section === 'form' && styles.innerTabActive]}
          >
            <Text style={[styles.innerTabText, section === 'form' && styles.innerTabTextActive]}>Chỉnh sửa</Text>
          </Pressable>
          <Pressable
            onPress={() => setSection('list')}
            style={[styles.innerTab, section === 'list' && styles.innerTabActive]}
          >
            <Text style={[styles.innerTabText, section === 'list' && styles.innerTabTextActive]}>Danh sách</Text>
          </Pressable>
        </View>

        <View style={styles.mainArea}>
          {section === 'form' ? (
            <>
              {editingSegment ? (
                <>
                  <SegmentForm initial={editingSegment} onSubmit={handleEdit} submitLabel="Cập nhật" />
                  <View style={styles.editActionsRow}>
                    <Pressable onPress={() => setEditingId(null)} style={[styles.secondaryButton]}>
                      <Text style={styles.secondaryButtonText}>Huỷ</Text>
                    </Pressable>
                    <Pressable onPress={handleDeleteEditing} style={[styles.secondaryButton, styles.dangerButton]}>
                      <Text style={[styles.secondaryButtonText, styles.dangerButtonText]}>Xoá</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <SegmentForm onSubmit={handleAdd} submitLabel="Thêm" />
              )}
            </>
          ) : (
            <View style={styles.listCard}>
              <Text style={styles.sectionTitle}>Danh sách phần thưởng</Text>
              <FlatList
                data={segments}
                keyExtractor={item => item.id}
                style={styles.list}
                contentContainerStyle={segments.length === 0 ? styles.listEmptyContainer : undefined}
                ListEmptyComponent={() => (
                  <View style={styles.emptyWrap}>
                    <Text style={styles.emptyTitle}>Chưa có phần thưởng</Text>
                    <Text style={styles.emptyDesc}>Chuyển sang tab “Chỉnh sửa” và bấm “Thêm”.</Text>
                  </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.sep} />}
                renderItem={({ item }) => {
                  return (
                    <View style={styles.row}>
                      <View style={[styles.dot, { backgroundColor: item.color }]} />
                      <View style={styles.rowText}>
                        <Text style={styles.rowLabel} numberOfLines={1}>
                          {item.label}
                        </Text>
                        <Text style={styles.rowValue}>Giá trị: {item.rewardValue}</Text>
                      </View>

                      <Pressable
                        onPress={() => {
                          setEditingId(item.id);
                          setSection('form');
                        }}
                        style={styles.smallButton}
                      >
                        <Text style={styles.smallButtonText}>Sửa</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleRemove(item.id)}
                        style={[styles.smallButton, styles.smallDanger]}
                      >
                        <Text style={[styles.smallButtonText, styles.smallDangerText]}>Xoá</Text>
                      </Pressable>
                    </View>
                  );
                }}
              />
            </View>
          )}
        </View>

        <Pressable onPress={handleSave} style={[styles.saveButton, !canSave && styles.saveDisabled]}>
          <Text style={styles.saveText}>Lưu vòng quay</Text>
        </Pressable>
        <Text style={styles.validationHint}>Yêu cầu: tối thiểu 2 phần, không để trống tên.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  title: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#93C5FD',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  previewTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
  },
  previewWheel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  forms: {
    flex: 1,
    gap: 12,
  },
  innerTabs: {
    flexDirection: 'row',
    backgroundColor: '#EAF2FF',
    borderRadius: 999,
    padding: 6,
    gap: 8,
  },
  innerTab: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  innerTabActive: {
    backgroundColor: '#A7F3D0',
  },
  innerTabText: {
    color: '#334155',
    fontWeight: '900',
  },
  innerTabTextActive: {
    color: '#0F172A',
  },
  mainArea: {
    flex: 1,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexGrow: 1,
    minHeight: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  list: {
    flex: 1,
  },
  listEmptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  emptyTitle: {
    color: '#0F172A',
    fontWeight: '900',
  },
  emptyDesc: {
    marginTop: 6,
    color: '#64748B',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },
  sep: {
    height: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    color: '#0F172A',
    fontWeight: '800',
  },
  rowValue: {
    marginTop: 2,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  smallButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  smallDanger: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF1F2',
  },
  smallButtonText: {
    color: '#334155',
    fontWeight: '800',
    fontSize: 12,
  },
  smallDangerText: {
    color: '#9F1239',
  },
  saveButton: {
    backgroundColor: '#7DD3FC',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: '#0F172A',
    fontWeight: '900',
  },
  validationHint: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  editActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontWeight: '900',
  },
  dangerButton: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECACA',
  },
  dangerButtonText: {
    color: '#9F1239',
  },
});
