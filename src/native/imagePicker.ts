import * as ImagePicker from 'expo-image-picker';

export type PickImageResult = { uri: string } | { permissionDenied: true } | null;

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
