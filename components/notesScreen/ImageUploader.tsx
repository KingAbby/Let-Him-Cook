import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet, Platform, Modal, ActionSheetIOS } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface ImageUploaderProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
  placeholder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageUri,
  onImageSelected,
  placeholder = "Tap to select an image"
}) => {
  const [showImageActionSheet, setShowImageActionSheet] = useState(false);

  const removeImage = () => {
    onImageSelected('');
  };

  // Fungsi sederhana untuk mengambil foto dari kamera
  const pickFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Diperlukan', 'Aplikasi memerlukan izin kamera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [4, 3]
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error kamera:', error);
      Alert.alert('Error', 'Gagal membuka kamera');
    }
  };

  // Fungsi sederhana untuk memilih foto dari galeri
  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Diperlukan', 'Aplikasi memerlukan izin akses galeri');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [4, 3]
      });

      console.log('Gallery result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error galeri:', error);
      Alert.alert('Error', 'Gagal membuka galeri');
    }
  };

  // Handle image picker with platform-specific UI
  const handleImagePicker = async () => {
    try {
      if (Platform.OS === 'ios') {
        // Use iOS native ActionSheet
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
            cancelButtonIndex: 0,
            title: 'Select Recipe Image',
            message: 'Choose an option to add your recipe image',
          },
          (buttonIndex) => {
            if (buttonIndex === 1) {
              pickFromCamera(); // Camera
            } else if (buttonIndex === 2) {
              pickFromGallery(); // Gallery
            }
          }
        );
      } else {
        // For Android, show custom bottom sheet
        setShowImageActionSheet(true);
      }
    } catch (error) {
      console.error("Error opening image picker:", error);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handleImagePicker}
          style={styles.uploadContainer}
        >
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <TouchableOpacity
                onPress={removeImage}
                style={styles.removeButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="camera-outline" size={40} color="#3b82f6" />
              <Text style={styles.placeholderText}>{placeholder}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Image Action Sheet for Android */}
      {Platform.OS === 'android' && (
        <Modal
          visible={showImageActionSheet}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowImageActionSheet(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowImageActionSheet(false)}
          >
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>
                  Select Recipe Image
                </Text>
                <Text style={styles.modalSubtitle}>
                  Choose an option to add your recipe image
                </Text>
              </View>

              {/* Options */}
              <View style={styles.modalOptions}>
                <TouchableOpacity
                  style={[styles.optionButton, styles.cameraOption]}
                  onPress={() => {
                    setShowImageActionSheet(false);
                    pickFromCamera();
                  }}
                >
                  <View style={[styles.optionIcon, styles.cameraIcon]}>
                    <Ionicons name="camera" size={20} color="white" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Take Photo</Text>
                    <Text style={styles.optionDescription}>Use camera to take a new photo</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, styles.galleryOption]}
                  onPress={() => {
                    setShowImageActionSheet(false);
                    pickFromGallery();
                  }}
                >
                  <View style={[styles.optionIcon, styles.galleryIcon]}>
                    <Ionicons name="images" size={20} color="white" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Choose from Gallery</Text>
                    <Text style={styles.optionDescription}>Select from your photo library</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowImageActionSheet(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
};

// Gunakan StyleSheet untuk menghindari warning dan performa yang lebih baik
const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  uploadContainer: {
    height: 160,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#6b7280',
  },
  // Modal styles for Android
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  modalOptions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cameraOption: {
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe',
  },
  galleryOption: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cameraIcon: {
    backgroundColor: '#3b82f6',
  },
  galleryIcon: {
    backgroundColor: '#22c55e',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});