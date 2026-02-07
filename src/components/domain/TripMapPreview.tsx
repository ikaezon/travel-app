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
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { useTripMapData } from '../../hooks/useTripMapData';
import { mockImages } from '../../data/mocks';
import {
  fontFamilies,
  glassStyles,
  glassConstants,
} from '../../theme';
import { usePressAnimation } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { AdaptiveGlassView } from '../ui/AdaptiveGlassView';

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
    <View style={[styles.container, theme.glass.cardWrapperStyle, { boxShadow: theme.glass.elevatedBoxShadow }]}>
      <AdaptiveGlassView
        intensity={24}
        darkIntensity={10}
        glassEffectStyle="clear"
        absoluteFill
        style={glassStyles.blurContent}
      />
      <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />

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
          userInterfaceStyle={theme.isDark ? 'dark' : 'light'}
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
        <AdaptiveGlassView
          intensity={40}
          darkIntensity={10}
          glassEffectStyle="clear"
          style={[styles.expandBadgeBlur, glassStyles.blurContentPill, theme.glass.pillContainerStyle]}
        >
          <MaterialIcons name="map" size={14} color={theme.colors.primary} />
          <Text style={[styles.expandBadgeText, { color: theme.colors.text.primary }]}>Expand View</Text>
        </AdaptiveGlassView>
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
    borderRadius: glassConstants.radius.card,
  },
  fallbackImage: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackImageStyle: {
    borderRadius: glassConstants.radius.card,
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
    borderRadius: glassConstants.radius.pill,
  },
  expandBadgeText: {
    fontSize: 13,
    fontFamily: fontFamilies.semibold,
  },
});
