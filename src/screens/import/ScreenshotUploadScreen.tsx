import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AdaptiveGlassView } from '../../components/ui/AdaptiveGlassView';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { MainStackParamList } from '../../navigation/types';
import { fontFamilies, glassStyles, glassConstants } from '../../theme';
import { usePressAnimation } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_SIZE = (SCREEN_WIDTH - 8) / 3;

interface Photo {
  id: string;
  uri: string;
  base64?: string;
}

export default function ScreenshotUploadScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const topOffset = insets.top + 8;
  const backAnim = usePressAnimation();
  const cancelAnim = usePressAnimation();
  const permissionAnim = usePressAnimation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status === 'granted') {
      loadPhotos();
    }
  };

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const result = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (result.granted) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newPhoto: Photo = {
          id: Date.now().toString(),
          uri: asset.uri,
          base64: asset.base64 ?? undefined,
        };
        setPhotos((prev) => [newPhoto, ...prev]);
        handlePhotoPress(newPhoto.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handlePhotoPress = (uri: string) => {
    setSelectedPhoto(uri);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCancelPress = () => {
    navigation.goBack();
  };

  const handleAutoScan = async () => {
    if (!selectedPhoto) {
      pickImage();
      return;
    }

    const photo = photos.find((p) => p.uri === selectedPhoto);
    navigation.navigate('ReviewDetails', {
      imageUri: selectedPhoto,
      base64: photo?.base64,
    });
  };

  const renderPhoto = ({ item }: { item: Photo }) => {
    const isSelected = selectedPhoto === item.uri;
    return (
      <Pressable
        style={[
          styles.photoContainer,
          isSelected && [
            styles.photoSelected,
            { borderColor: theme.colors.primary, shadowColor: theme.colors.primary },
          ],
        ]}
        onPress={() => handlePhotoPress(item.uri)}
      >
        <Image source={{ uri: item.uri }} style={styles.photo} />
        {isSelected && (
          <View style={[styles.selectedOverlay, { backgroundColor: theme.colors.primaryLight }]}>
            <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
              <MaterialIcons name="check" size={20} color="white" />
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  if (hasPermission === null) {
    return (
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </LinearGradient>
    );
  }

  if (hasPermission === false) {
    return (
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.centerContent}>
          <MaterialIcons name="photo-library" size={64} color={theme.colors.text.tertiary} />
          <Text style={[styles.permissionTitle, { color: theme.colors.text.primary }]}>Photos Access Required</Text>
          <Text style={[styles.permissionText, { color: theme.colors.text.secondary }]}>
            Please enable photo library access in Settings to select screenshots.
          </Text>
          <Animated.View style={{ transform: [{ scale: permissionAnim.scaleAnim }] }}>
          <Pressable style={[styles.settingsButton, { backgroundColor: theme.colors.primary }]} onPress={requestPermission} onPressIn={permissionAnim.onPressIn} onPressOut={permissionAnim.onPressOut}>
            <Text style={styles.settingsButtonText}>Request Permission</Text>
          </Pressable>
          </Animated.View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
        <View style={styles.container}>
        <View style={[styles.instructions, { paddingTop: topOffset + 72 }]}>
          <Text style={[styles.instructionsText, { color: theme.colors.text.secondary }]}>
            Select a screenshot of your reservation confirmation from your library.
          </Text>
        </View>

        <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.photoGrid}
        columnWrapperStyle={styles.photoRow}
        ListHeaderComponent={
          <Pressable style={[styles.photoContainer, { backgroundColor: theme.isDark ? theme.colors.surface : theme.colors.border }]} onPress={pickImage}>
            <View style={styles.addPhotoPlaceholder}>
              <MaterialIcons name="add-photo-alternate" size={40} color={theme.colors.text.secondary} />
              <Text style={[styles.addPhotoText, { color: theme.colors.text.secondary }]}>Select Photo</Text>
            </View>
          </Pressable>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>Loading photos...</Text>
            </View>
          ) : null
        }
        />

        <View style={[styles.fabContainer, { bottom: insets.bottom + 40 }]}>
          <View style={styles.fabInner}>
            <ShimmerButton
              label="Auto-Scan with AI"
              iconName="auto-fix-high"
              onPress={handleAutoScan}
              variant="boardingPass"
            />
          </View>
        </View>

        <View style={[styles.headerContainer, { top: topOffset }]}>
          <AdaptiveGlassView intensity={24} useGlassInLightMode style={[styles.headerBlur, glassStyles.blurContentLarge, theme.glass.navWrapperStyle]}>
            {!theme.isDark && <View style={[styles.glassOverlay, { backgroundColor: theme.glass.overlayStrong }]} pointerEvents="none" />}
            <View style={styles.headerContent}>
              <Animated.View style={{ transform: [{ scale: backAnim.scaleAnim }] }}>
              <Pressable style={styles.backButton} onPress={handleBackPress} onPressIn={backAnim.onPressIn} onPressOut={backAnim.onPressOut}>
                <MaterialIcons name="chevron-left" size={24} color={theme.colors.primary} />
                <Text style={[styles.backText, { color: theme.colors.primary }]}>Back</Text>
              </Pressable>
              </Animated.View>
              <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Upload Screenshot</Text>
              <Animated.View style={{ transform: [{ scale: cancelAnim.scaleAnim }] }}>
              <Pressable style={styles.cancelButton} onPress={handleCancelPress} onPressIn={cancelAnim.onPressIn} onPressOut={cancelAnim.onPressOut}>
                <Text style={[styles.cancelText, { color: theme.colors.text.secondary }]}>Cancel</Text>
              </Pressable>
              </Animated.View>
            </View>
          </AdaptiveGlassView>
        </View>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
  },
  headerBlur: {
    ...glassStyles.navBarWrapper,
    width: '90%',
    maxWidth: 340,
    position: 'relative',
    height: 56,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  glassOverlay: {
    ...glassStyles.cardOverlay,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  backText: {
    fontSize: 16,
    fontFamily: fontFamilies.medium,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    letterSpacing: -0.3,
    flex: 1,
    textAlign: 'center',
  },
  cancelButton: {
    paddingLeft: 8,
    minWidth: 64,
    alignItems: 'flex-end',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: fontFamilies.medium,
  },
  instructions: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  instructionsText: {
    fontSize: 15,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
    lineHeight: 22,
  },
  photoGrid: {
    paddingHorizontal: 4,
    paddingBottom: 140,
  },
  photoRow: {
    gap: 4,
    marginBottom: 4,
  },
  photoContainer: {
    width: IMAGE_SIZE,
    aspectRatio: 9 / 18,
    borderRadius: glassConstants.radius.icon,
    overflow: 'hidden',
    backgroundColor: undefined,
  },
  photoSelected: {
    borderWidth: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: glassConstants.radius.icon,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addPhotoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addPhotoText: {
    fontSize: 12,
    fontFamily: fontFamilies.semibold,
    color: '#64748b',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontFamily: fontFamilies.semibold,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
    lineHeight: 22,
  },
  settingsButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: glassConstants.radius.icon,
  },
  settingsButtonText: {
    fontSize: 16,
    fontFamily: fontFamilies.semibold,
    color: 'white',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: fontFamilies.regular,
  },
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 30,
  },
  fabInner: {
    paddingHorizontal: 24,
    maxWidth: 480,
    marginHorizontal: 'auto',
  },
});
