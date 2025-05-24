import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Alert } from 'react-native';
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
  const [modalVisible, setModalVisible] = useState(false);

  const openImagePickerModal = () => {
    setModalVisible(true);
  };

  const removeImage = () => {
    onImageSelected('');
  };

  const takePhoto = async () => {
    setModalVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    setModalVisible(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <>
      <TouchableOpacity 
        onPress={openImagePickerModal}
        className="mx-4 mt-4 h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 justify-center items-center"
      >
        {imageUri ? (
          <View className="w-full h-full relative">
            <Image source={{ uri: imageUri }} className="w-full h-full rounded-lg" />
            <TouchableOpacity 
              onPress={removeImage}
              className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center">
            <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2">{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          className="flex-1 justify-end"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white rounded-t-xl p-5">
            <View className="items-center mb-4">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>
            
            <Text className="text-xl font-bold text-center mb-4">Select Photo</Text>
            
            <TouchableOpacity 
              onPress={takePhoto}
              className="flex-row items-center p-4 mb-3 bg-gray-100 rounded-lg"
            >
              <Ionicons name="camera-outline" size={24} color="#4B5563" />
              <Text className="ml-3 text-gray-800 font-medium">Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={pickFromGallery}
              className="flex-row items-center p-4 mb-3 bg-gray-100 rounded-lg"
            >
              <Ionicons name="images-outline" size={24} color="#4B5563" />
              <Text className="ml-3 text-gray-800 font-medium">Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              className="flex-row items-center justify-center p-4 mt-2 bg-[#ff6b6b] rounded-lg"
            >
              <Text className="text-white font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};