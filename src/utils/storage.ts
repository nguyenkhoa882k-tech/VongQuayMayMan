import AsyncStorage from '@react-native-async-storage/async-storage';

import type { WheelSegmentData } from './wheelMath';

const STORAGE_KEY = 'CUSTOM_WHEEL_SEGMENTS_V1';

export async function loadSegments(fallback: WheelSegmentData[]): Promise<WheelSegmentData[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return fallback;
    }

    const cleaned: WheelSegmentData[] = parsed
      .map((item: any) => ({
        id: String(item?.id ?? ''),
        label: String(item?.label ?? ''),
        color: String(item?.color ?? ''),
        rewardValue: Number(item?.rewardValue ?? 0),
      }))
      .filter(s => Boolean(s.id) && Boolean(s.label) && Boolean(s.color) && Number.isFinite(s.rewardValue));

    return cleaned.length >= 2 ? cleaned : fallback;
  } catch {
    return fallback;
  }
}

export async function saveSegments(segments: WheelSegmentData[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(segments));
}
