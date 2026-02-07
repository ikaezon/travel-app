import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlassNavHeader } from '../../components/navigation/GlassNavHeader';
import { MainStackParamList } from '../../navigation/types';
import { useTripMapData } from '../../hooks/useTripMapData';
import { fontFamilies } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'MapExpand'>;
type MapExpandRouteProp = RouteProp<MainStackParamList, 'MapExpand'>;

export default function MapExpandScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MapExpandRouteProp>();
  const tripId = route.params?.tripId || '';
  const tripName = route.params?.tripName || 'Map';

  const { region, markers, isLoading, hasData } = useTripMapData(tripId);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (region && mapRef.current) {
      mapRef.current.animateToRegion(region, 0);
    }
  }, [region]);

  const handleMapReady = useCallback(() => {
    if (region && mapRef.current) {
      mapRef.current.animateToRegion(region, 0);
    }
  }, [region]);

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

  const handleOpenInMaps = useCallback(() => {
    if (markers.length === 0) return;

    const target = markers.find((m) => m.isDestination) || markers[0];
    const encodedAddress = encodeURIComponent(target.title);

    const url = Platform.select({
      ios: `maps://maps.apple.com/?daddr=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
      default: `https://maps.apple.com/?daddr=${encodedAddress}`,
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(
          `https://maps.apple.com/?daddr=${encodedAddress}`,
        );
      }
    });
  }, [markers]);

  if (isLoading) {
    return (
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
        <GlassNavHeader
          title={tripName}
          label="Map"
          onBackPress={handleBackPress}
        />
      </LinearGradient>
    );
  }

  if (!hasData || !region) {
    return (
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.centeredContainer}>
          <MaterialIcons
            name="location-off"
            size={48}
            color={theme.colors.text.tertiary}
          />
          <Text style={[styles.noDataTitle, { color: theme.colors.text.primary }]}>No location data available</Text>
          <Text style={[styles.noDataSubtitle, { color: theme.colors.text.secondary }]}>
            Add reservations with addresses to see them on the map.
          </Text>
        </View>
        <GlassNavHeader
          title={tripName}
          label="Map"
          onBackPress={handleBackPress}
        />
      </LinearGradient>
    );
  }

  return (
    <View style={styles.fullscreen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onMapReady={handleMapReady}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass
        toolbarEnabled={false}
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
            pinColor={
              marker.isDestination ? theme.colors.primary : theme.colors.status.error
            }
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={[styles.calloutTitle, { color: theme.colors.text.primary }]}>{marker.title}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <GlassNavHeader
        title={tripName}
        label="Map"
        onBackPress={handleBackPress}
        rightAction={{
          icon: 'open-in-new',
          onPress: handleOpenInMaps,
          accessibilityLabel: 'Open in Maps app',
        }}
        showRightAction={markers.length > 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  fullscreen: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  noDataTitle: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    textAlign: 'center',
  },
  noDataSubtitle: {
    fontSize: 14,
    fontFamily: fontFamilies.medium,
    textAlign: 'center',
  },
  callout: {
    padding: 8,
    minWidth: 120,
    maxWidth: 200,
  },
  calloutTitle: {
    fontSize: 14,
    fontFamily: fontFamilies.semibold,
  },
});
