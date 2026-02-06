import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ImageBackground,
  Animated,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { useTripMapData } from '../../hooks/useTripMapData';
import { mockImages } from '../../data/mocks';
import {
  fontFamilies,
  glassStyles,
} from '../../theme';
import { usePressAnimation } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';

interface TripMapPreviewProps {
  tripId: string;
  onExpandPress: () => void;
}

/**
 * Inline map preview that shows geocoded trip/reservation locations.
 * Falls back to a placeholder image when geocoding is unavailable or returns no results.
 */
export function TripMapPreview({ tripId, onExpandPress }: TripMapPreviewProps) {
  const theme = useTheme();
  const { region, markers, isLoading, hasData } = useTripMapData(tripId, {
    destinationOnly: true,
  });

  const { scaleAnim: expandScale, onPressIn: expandPressIn, onPressOut: expandPressOut } = usePressAnimation();

  const handleExpandPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onExpandPress();
  }, [onExpandPress]);

  return (
    <View style={[styles.container, { boxShadow: theme.glassShadows.elevated }]}>
      <BlurView
        intensity={24}
        tint={theme.blurTint}
        style={[StyleSheet.absoluteFill, glassStyles.blurContent]}
      />
      <View style={[styles.glassOverlay, { backgroundColor: theme.glassColors.overlayStrong }]} pointerEvents="none" />

      {isLoading && (
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {!isLoading && hasData && region && (
        <MapView
          style={styles.map}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          pointerEvents="none"
          mapType="standard"
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title}
              pinColor={marker.isDestination ? theme.colors.primary : theme.colors.status.error}
            />
          ))}
        </MapView>
      )}

      {!isLoading && !hasData && (
        <ImageBackground
          source={{ uri: mockImages.mapPlaceholder }}
          style={styles.fallbackImage}
          imageStyle={styles.fallbackImageStyle}
        >
          <View style={styles.fallbackOverlay}>
            <MaterialIcons
              name="location-off"
              size={24}
              color={theme.colors.text.tertiary}
            />
            <Text style={[styles.fallbackText, { color: theme.colors.text.tertiary }]}>No location data</Text>
          </View>
        </ImageBackground>
      )}

      {/* Expand View badge */}
      <Animated.View style={[styles.expandBadge, { transform: [{ scale: expandScale }] }]}>
      <Pressable
        onPress={handleExpandPress}
        onPressIn={expandPressIn}
        onPressOut={expandPressOut}
        accessibilityLabel="Expand map view"
        accessibilityRole="button"
      >
        <BlurView
          intensity={40}
          tint={theme.blurTint}
          style={[styles.expandBadgeBlur, glassStyles.blurContentPill, { borderColor: theme.glassColors.borderStrong }]}
        >
          <MaterialIcons name="map" size={14} color={theme.colors.primary} />
          <Text style={[styles.expandBadgeText, { color: theme.colors.text.primary }]}>Expand View</Text>
        </BlurView>
      </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...glassStyles.cardWrapper,
    width: '100%',
    height: 180,
    borderWidth: 1,
    overflow: 'hidden',
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
  },
  centeredContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  fallbackImage: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackImageStyle: {
    borderRadius: 24,
  },
  fallbackOverlay: {
    alignItems: 'center',
    gap: 4,
  },
  fallbackText: {
    fontSize: 12,
    fontFamily: fontFamilies.medium,
  },
  expandBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    zIndex: 10,
  },
  expandBadgeBlur: {
    ...glassStyles.pillContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  expandBadgeText: {
    fontSize: 13,
    fontFamily: fontFamilies.semibold,
  },
});
