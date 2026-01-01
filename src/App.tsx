import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LuckyWheelScreen from './screens/LuckyWheelScreen';
import WheelEditorScreen from './screens/WheelEditorScreen';
import { defaultSegments } from './data/defaultSegments';
import { loadSegments } from './utils/storage';
import type { WheelSegmentData } from './utils/wheelMath';
import DebugAdBanner from './components/DebugAdBanner';

type ScreenKey = 'play' | 'edit';

function App() {
  const [screen, setScreen] = useState<ScreenKey>('play');
  const [segments, setSegments] = useState<WheelSegmentData[] | null>(null);

  const transition = useRef(new Animated.Value(0)).current;
  const transitionTo = useCallback(
    (next: ScreenKey) => {
      setScreen(next);
      Animated.timing(transition, {
        toValue: next === 'play' ? 0 : 1,
        duration: 240,
        useNativeDriver: true,
      }).start();
    },
    [transition],
  );

  const playOpacity = useMemo(() => transition.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), [
    transition,
  ]);
  const editOpacity = useMemo(() => transition.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }), [
    transition,
  ]);
  const playTranslateY = useMemo(
    () => transition.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }),
    [transition],
  );
  const editTranslateY = useMemo(
    () => transition.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
    [transition],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const loaded = await loadSegments(defaultSegments);
        if (!cancelled) {
          setSegments(loaded);
        }
      } catch {
        if (!cancelled) {
          setSegments(defaultSegments);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSavedSegments = useCallback((next: WheelSegmentData[]) => {
    setSegments(next);
    transitionTo('play');
  }, []);

  if (!segments) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingRoot}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Đang tải vòng quay...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <View style={styles.navRow}>
          <View style={styles.navPill}>
            <TouchableOpacity
              onPress={() => transitionTo('play')}
              style={[styles.navButton, screen === 'play' && styles.navButtonActive]}
              activeOpacity={0.9}
            >
              <Text style={[styles.navButtonText, screen === 'play' && styles.navButtonTextActive]}>
                Chơi
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => transitionTo('edit')}
              style={[styles.navButton, screen === 'edit' && styles.navButtonActive]}
              activeOpacity={0.9}
            >
              <Text style={[styles.navButtonText, screen === 'edit' && styles.navButtonTextActive]}>
                Tuỳ chỉnh
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <Animated.View
            pointerEvents={screen === 'play' ? 'auto' : 'none'}
            style={[styles.screenLayer, { opacity: playOpacity, transform: [{ translateY: playTranslateY }] }]}
          >
            <LuckyWheelScreen segments={segments} />
          </Animated.View>
          <Animated.View
            pointerEvents={screen === 'edit' ? 'auto' : 'none'}
            style={[styles.screenLayer, { opacity: editOpacity, transform: [{ translateY: editTranslateY }] }]}
          >
            <WheelEditorScreen initialSegments={segments} onSaved={handleSavedSegments} />
          </Animated.View>
        </View>

        <DebugAdBanner enabled />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7FAFF',
  },
  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFF',
  },
  loadingText: {
    marginTop: 12,
    color: '#334155',
  },
  navRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  navPill: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#EAF2FF',
    borderRadius: 999,
    padding: 6,
    gap: 8,
  },
  navButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  navButtonActive: {
    backgroundColor: '#7DD3FC',
  },
  navButtonText: {
    color: '#334155',
    fontWeight: '700',
  },
  navButtonTextActive: {
    color: '#0F172A',
  },
  content: {
    flex: 1,
    paddingTop: 4,
  },
  screenLayer: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default App;
