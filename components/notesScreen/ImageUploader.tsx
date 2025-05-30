import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet, Platform } from 'react-native';
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

  // Tampilan opsi saat tombol ditekan
  const showImageOptions = () => {
    Alert.alert(
      'Pilih Foto',
      'Pilih sumber gambar',
      [
        {
          text: 'Kamera',
          onPress: pickFromCamera
        },
        {
          text: 'Galeri',
          onPress: pickFromGallery
        },
        {
          text: 'Batal',
          style: 'cancel'
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={showImageOptions}
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
            <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
            <Text style={styles.placeholderText}>{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Gunakan StyleSheet untuk menghindari warning dan performa yang lebih baik
const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  uploadContainer: {
    height: 160,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
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
});