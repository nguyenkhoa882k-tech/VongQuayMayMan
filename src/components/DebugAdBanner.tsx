import React, { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

type Props = {
  enabled?: boolean;
};

export default function DebugAdBanner({ enabled }: Props) {
  const shouldShow = Boolean(enabled) && __DEV__;

  const unitId = useMemo(() => {
    return TestIds.BANNER;
  }, []);

  useEffect(() => {
    if (!shouldShow) {
      return;
    }

    mobileAds()
      .initialize()
      .catch(() => {
        // Ignore init errors in debug
      });
  }, [shouldShow]);

  if (!shouldShow) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.select({ ios: 6, android: 0 }),
  },
});
