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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { MainStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_SIZE = (SCREEN_WIDTH - 8) / 3;

interface Photo {
  id: string;
  uri: string;
}

export default function ScreenshotUploadScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
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
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: Photo = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
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

  const handleAutoScan = () => {
    if (!selectedPhoto) {
      pickImage();
      return;
    }

    setIsParsing(true);

    setTimeout(() => {
      setIsParsing(false);
      navigation.navigate('ReviewDetails', { imageUri: selectedPhoto });
    }, 2000);
  };

  const renderPhoto = ({ item }: { item: Photo }) => {
    const isSelected = selectedPhoto === item.uri;
    return (
      <Pressable
        style={[styles.photoContainer, isSelected && styles.photoSelected]}
        onPress={() => handlePhotoPress(item.uri)}
      >
        <Image source={{ uri: item.uri }} style={styles.photo} />
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <View style={styles.checkmark}>
              <MaterialIcons name="check" size={20} color="white" />
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#13a4ec" />
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <MaterialIcons name="photo-library" size={64} color="#94a3b8" />
          <Text style={styles.permissionTitle}>Photos Access Required</Text>
          <Text style={styles.permissionText}>
            Please enable photo library access in Settings to select screenshots.
          </Text>
          <Pressable style={styles.settingsButton} onPress={requestPermission}>
            <Text style={styles.settingsButtonText}>Request Permission</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <MaterialIcons name="chevron-left" size={28} color="#13a4ec" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Upload Screenshot</Text>
        <Pressable style={styles.cancelButton} onPress={handleCancelPress}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
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
          <Pressable style={styles.photoContainer} onPress={pickImage}>
            <View style={styles.addPhotoPlaceholder}>
              <MaterialIcons name="add-photo-alternate" size={40} color="#94a3b8" />
              <Text style={styles.addPhotoText}>Select Photo</Text>
            </View>
          </Pressable>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#13a4ec" />
              <Text style={styles.loadingText}>Loading photos...</Text>
            </View>
          ) : null
        }
      />

      <View style={styles.fabContainer}>
        <View style={styles.fabInner}>
          <ShimmerButton
            label="Auto-Scan with AI"
            iconName="auto-fix-high"
            onPress={handleAutoScan}
            disabled={isParsing}
          />
        </View>
      </View>

      {isParsing && (
        <View style={styles.parsingOverlay}>
          <View style={styles.parsingCard}>
            <View style={styles.parsingHeader}>
              <View style={styles.parsingIconContainer}>
                <ActivityIndicator size="small" color="#13a4ec" />
                <MaterialIcons
                  name="smart-toy"
                  size={20}
                  color="#13a4ec"
                  style={styles.parsingIcon}
                />
              </View>
              <View style={styles.parsingTextContainer}>
                <Text style={styles.parsingTitle}>Parsing your reservation...</Text>
                <Text style={styles.parsingSubtitle}>
                  Extracting dates, location, and details
                </Text>
              </View>
            </View>
            <View style={styles.skeletonContainer}>
              <View style={[styles.skeletonBar, styles.skeletonBar1]} />
              <View style={[styles.skeletonBar, styles.skeletonBar2]} />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.5)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#13a4ec',
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111618',
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
    fontWeight: '500',
    color: '#64748b',
  },
  instructions: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  instructionsText: {
    fontSize: 15,
    color: '#64748b',
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
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
  },
  photoSelected: {
    borderWidth: 4,
    borderColor: '#13a4ec',
    shadowColor: '#13a4ec',
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
    backgroundColor: 'rgba(19, 164, 236, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#13a4ec',
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
    fontWeight: '600',
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
    fontWeight: '700',
    color: '#111618',
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  settingsButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#13a4ec',
    borderRadius: 8,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  fabInner: {
    paddingHorizontal: 24,
    maxWidth: 480,
    marginHorizontal: 'auto',
  },
  parsingOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 40,
  },
  parsingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 12,
  },
  parsingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  parsingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19, 164, 236, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  parsingIcon: {
    position: 'absolute',
  },
  parsingTextContainer: {
    flex: 1,
  },
  parsingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111618',
  },
  parsingSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  skeletonContainer: {
    paddingLeft: 52,
    gap: 8,
  },
  skeletonBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
  },
  skeletonBar1: {
    width: '75%',
  },
  skeletonBar2: {
    width: '50%',
  },
});
