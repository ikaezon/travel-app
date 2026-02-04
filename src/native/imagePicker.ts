/**
 * Image picker abstraction over Expo ImagePicker.
 * Use this instead of importing expo-image-picker in screens so behavior
 * can be mocked in tests and permission/error handling is consistent.
 */

import * as ImagePicker from 'expo-image-picker';

export type PickImageResult = { uri: string } | { permissionDenied: true } | null;

/**
 * Request media library permission and open the image picker.
 * - Returns { uri } on success.
 * - Returns { permissionDenied: true } if the user denied permission.
 * - Returns null if the user canceled the picker.
 */
export async function pickImageFromLibrary(): Promise<PickImageResult> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return { permissionDenied: true };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: false,
    quality: 1,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return { uri: result.assets[0].uri };
}
