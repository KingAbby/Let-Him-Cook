import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Modal, Dimensions} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const PhotoPicker = ({ selectedImage, setSelectedImage }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const openCamera = async () => {
        // Request permission
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Error', 'Camera permission is required');
            return;
        }

        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        setModalVisible(false);
        if (!result.canceled && result.assets && result.assets[0]) {
            setSelectedImage(result.assets[0]);
        }
    };

    const openGallery = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Error', 'Gallery permission is required');
            return;
        }

        // Launch image library
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        setModalVisible(false);
        if (!result.canceled && result.assets && result.assets[0]) {
            setSelectedImage(result.assets[0]);
        }
    };

    const removeImage = () => {
        Alert.alert(
            'Hapus Foto',
            'Apakah Anda yakin ingin menghapus foto ini?',
            [
                { text: 'Batal', style: 'cancel' },
                { text: 'Hapus', style: 'destructive', onPress: () => setSelectedImage(null) },
            ]
        );
    };

    const showImagePicker = () => {
        setModalVisible(true);
    };

    return (
        <View>
            {/* Photo Container - Make this a View instead of TouchableOpacity */}
            <View className="relative">
                {/* Container with border */}
                <View
                    className={`w-full h-48 rounded-lg border-2 border-dashed border-gray-400 bg-zinc-200 items-center justify-center ${selectedImage ? 'border-solid border-green-500' : ''
                        }`}
                >
                    {selectedImage ? (
                        <>
                            {/* Image display */}
                            <Image
                                source={{ uri: selectedImage.uri }}
                                className="w-full h-full rounded-lg"
                                resizeMode="cover"
                            />

                            {/* Separate TouchableOpacity just for the delete button */}
                            <TouchableOpacity
                                className="absolute top-2 right-2 bg-red-500 rounded-full w-10 h-10 items-center justify-center z-10"
                                onPress={removeImage}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                activeOpacity={0.7}
                            >
                                <Text className="text-white font-bold text-lg">×</Text>
                            </TouchableOpacity>

                            {/* Add a touch layer that doesn't do anything when image exists */}
                            <TouchableOpacity
                                className="absolute top-0 left-0 right-0 bottom-0 z-5"
                                onPress={null}
                                activeOpacity={1}
                            />
                        </>
                    ) : (
                        /* TouchableOpacity only for when no image */
                        <TouchableOpacity
                            className="w-full h-full items-center justify-center"
                            onPress={showImagePicker}
                        >
                            {/* Camera Icon */}
                            <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-3">
                                <View className="w-10 h-8 items-center justify-center">
                                    <View className="w-6 h-4 border-2 border-gray-400 rounded-sm" />
                                    <View className="absolute top-1 w-2 h-1 bg-gray-400 rounded-full" />
                                </View>
                            </View>

                            {/* Text */}
                            <Text className="text-gray-600 font-medium text-base">
                                Add Cooking Photo
                            </Text>
                            <Text className="text-gray-400 text-sm mt-1">
                                Tap to add photos
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Modal for Image Picker Options */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <Text className="text-lg font-bold text-gray-800 text-center mb-6">
                            Select Photo Source
                        </Text>

                        {/* Camera Option */}
                        <TouchableOpacity
                            onPress={openCamera}
                            className="flex-row items-center p-4 bg-gray-50 rounded-lg mb-3"
                        >
                            <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
                                <View className="w-7 h-6 bg-white rounded-sm items-center justify-center">
                                    <View className="w-4 h-3 border border-blue-500 rounded-sm" />
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-medium text-gray-800">
                                    Take a photo
                                </Text>
                                <Text className="text-sm text-gray-500">
                                    Use the camera to take photos
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Gallery Option */}
                        <TouchableOpacity
                            onPress={openGallery}
                            className="flex-row items-center p-4 bg-gray-50 rounded-lg mb-6"
                        >
                            <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mr-4">
                                <View className="w-7 h-6 bg-white rounded-sm items-center justify-center">
                                    <View className="w-5 h-4 bg-green-500 rounded-sm" />
                                    <View className="absolute bottom-0 right-0 w-3 h-2 bg-green-400 rounded-sm" />
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-medium text-gray-800">
                                    Choose from gallery
                                </Text>
                                <Text className="text-sm text-gray-500">
                                    Select a photo from your device gallery
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="p-4 bg-gray-200 rounded-lg"
                        >
                            <Text className="text-center text-base font-medium text-gray-700">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default PhotoPicker;