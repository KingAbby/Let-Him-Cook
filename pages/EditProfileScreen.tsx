import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { LinearGradient } from "expo-linear-gradient";

const HEADER_HEIGHT = Platform.OS === "ios" ? 150 : 70;

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.user_metadata?.avatar_url || null
  );
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    (async () => {
      // Request camera and photo library permissions
      if (Platform.OS !== "web") {
        const { status: cameraStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== "granted" || libraryStatus !== "granted") {
          Alert.alert(
            "Permission Required",
            "Sorry, we need camera and photo library permissions to make this work!"
          );
        }
      }
    })();
  }, []);

  const pickImage = async (useCamera = false) => {
    try {
      setShowImageOptions(false);
      setLoading(true);

      let result;
      if (useCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets[0].base64) {
        const base64Image = result.assets[0].base64;
        const filePath = `public/avatar_${user?.id}_${Date.now()}.jpg`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(filePath, decode(base64Image), {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (error) {
          throw error;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        const avatarUrl = publicUrlData.publicUrl;

        // Update user metadata with avatar URL
        await updateUserWithAvatar(avatarUrl);

        // Set local state
        setProfileImage(avatarUrl);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateUserWithAvatar = async (avatarUrl: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error updating user avatar:", error);
      Alert.alert("Error", "Failed to update profile picture.");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: name.trim() },
      });

      if (error) {
        throw error;
      }

      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert("Error", "Please enter your current password");
      return;
    }

    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setPasswordLoading(true);

    try {
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        Alert.alert("Error", "Current password is incorrect");
        setPasswordLoading(false);
        return;
      }

      // If current password is correct, update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      Alert.alert("Success", "Password updated successfully");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      Alert.alert("Error", error.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <Header
        title="Edit Profile"
        showBackButton={true}
        rightIcon={<Ionicons name="checkmark" size={22} color="white" />}
        onRightIconPress={handleSave}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: HEADER_HEIGHT,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Picture Section */}
          <View className="items-center mt-4 mb-6">
            <TouchableOpacity
              onPress={() => setShowImageOptions(true)}
              className="relative"
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-blue-500 items-center justify-center">
                  <Text className="text-white text-3xl font-bold">
                    {name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="absolute bottom-0 right-0 bg-gray-100 p-2 rounded-full border-2 border-white">
                <Ionicons name="camera" size={16} color="#3B82F6" />
              </View>
            </TouchableOpacity>
            <Text className="text-gray-500 text-sm mt-2">
              Tap to change profile picture
            </Text>
          </View>

          <View className="mx-4 bg-white rounded-2xl shadow-sm p-5">
            <Text className="text-lg font-semibold text-gray-800 mb-6">
              Update Your Profile
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Full Name
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 px-3">
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 px-2 py-3"
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Email
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 px-3">
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 px-2 py-3 text-gray-500"
                  value={user?.email || ""}
                  editable={false}
                />
              </View>
              <Text className="text-xs text-gray-500 mt-1 ml-1">
                Email cannot be changed
              </Text>
            </View>

            {/* Password Change Button */}
            <TouchableOpacity
              className="flex-row items-center justify-between bg-gray-50 rounded-lg border border-gray-200 px-4 py-3 mt-2"
              onPress={() => setShowPasswordModal(true)}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6B7280"
                />
                <Text className="text-gray-700 ml-2">Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full py-3 bg-blue-500 rounded-lg mt-6"
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center text-white font-bold">
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={() => setShowImageOptions(false)}
        >
          <View className="bg-white rounded-t-3xl p-5">
            <View className="w-16 h-1 bg-gray-300 rounded-full self-center mb-6" />
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Choose Profile Picture
            </Text>

            <TouchableOpacity
              className="flex-row items-center py-3 px-4 mb-3 bg-gray-50 rounded-xl"
              onPress={() => pickImage(true)}
            >
              <Ionicons name="camera-outline" size={24} color="#3B82F6" />
              <Text className="ml-3 text-gray-700 font-medium">
                Take a Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-3 px-4 mb-3 bg-gray-50 rounded-xl"
              onPress={() => pickImage(false)}
            >
              <Ionicons name="image-outline" size={24} color="#3B82F6" />
              <Text className="ml-3 text-gray-700 font-medium">
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-3 px-4 mb-3 bg-gray-50 rounded-xl"
              onPress={() => {
                setProfileImage(null);
                setShowImageOptions(false);
                updateUserWithAvatar("");
              }}
            >
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
              <Text className="ml-3 text-gray-700 font-medium">
                Remove Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 bg-gray-200 rounded-xl py-3"
              onPress={() => setShowImageOptions(false)}
            >
              <Text className="text-gray-700 font-medium text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={() => setShowPasswordModal(false)}
        >
          <View className="bg-white rounded-t-3xl p-5">
            <View className="w-16 h-1 bg-gray-300 rounded-full self-center mb-6" />
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Change Password
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Current Password
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 px-3">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6B7280"
                />
                <TextInput
                  className="flex-1 px-2 py-3"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={true}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                New Password
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 px-3">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6B7280"
                />
                <TextInput
                  className="flex-1 px-2 py-3"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={true}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 px-3">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6B7280"
                />
                <TextInput
                  className="flex-1 px-2 py-3"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={true}
                />
              </View>
            </View>

            <TouchableOpacity
              className="w-full py-3 bg-blue-500 rounded-lg mb-3"
              onPress={handleChangePassword}
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center text-white font-bold">
                  Update Password
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-2 bg-gray-200 rounded-xl py-3"
              onPress={() => setShowPasswordModal(false)}
            >
              <Text className="text-gray-700 font-medium text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default EditProfileScreen;
