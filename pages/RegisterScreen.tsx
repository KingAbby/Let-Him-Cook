import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../components/navigation/routes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const handleRegister = async () => {
    Keyboard.dismiss();

    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    const { data, error } = await signUp(email, password, name);
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Registration Successful",
        "Your account has been created successfully. Please login with your credentials.",
        [
          {
            text: "Go to Login",
            onPress: () => {
              navigation.navigate(ROUTES.LOGIN, { email });
            },
          },
        ]
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handler untuk scroll otomatis saat input difokuskan
  const handleFocus = (yOffset: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yOffset, animated: true });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <LinearGradient colors={["#f8fafc", "#f1f5f9"]} className="flex-1">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="min-h-full justify-center px-6 py-12">
              {/* Logo/App Name dengan Icon */}
              <View className="items-center mb-8">
                <View className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-lg">
                  <LinearGradient
                    colors={["#3B82F6", "#60A5FA"]}
                    className="w-full h-full items-center justify-center"
                  >
                    <Ionicons name="restaurant" size={48} color="white" />
                  </LinearGradient>
                </View>
                <Text className="text-3xl font-bold text-gray-800">
                  Let Him Cook
                </Text>
                <Text className="text-base text-gray-600 mt-2">
                  Create your account
                </Text>
              </View>

              {/* Form dengan Card Effect */}
              <View className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm mx-auto">
                <View className="mb-5">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-3 overflow-hidden">
                    <Ionicons name="person-outline" size={20} color="#6B7280" />
                    <TextInput
                      className="flex-1 px-2 py-3.5"
                      placeholder="Enter your full name"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      onFocus={() => handleFocus(50)}
                    />
                  </View>
                </View>

                <View className="mb-5">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Email
                  </Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-3 overflow-hidden">
                    <Ionicons name="mail-outline" size={20} color="#6B7280" />
                    <TextInput
                      className="flex-1 px-2 py-3.5"
                      placeholder="Enter your email"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onFocus={() => handleFocus(120)}
                    />
                  </View>
                </View>

                <View className="mb-5">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Password
                  </Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-3 overflow-hidden">
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#6B7280"
                    />
                    <TextInput
                      className="flex-1 px-2 py-3.5"
                      placeholder="Create a password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      onFocus={() => handleFocus(190)}
                    />
                    <TouchableOpacity
                      onPress={togglePasswordVisibility}
                      className="p-2"
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-3 overflow-hidden">
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#6B7280"
                    />
                    <TextInput
                      className="flex-1 px-2 py-3.5"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      onFocus={() => handleFocus(260)}
                    />
                    <TouchableOpacity
                      onPress={toggleConfirmPasswordVisibility}
                      className="p-2"
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  className="w-full overflow-hidden rounded-xl shadow-md mb-4"
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={["#3B82F6", "#60A5FA"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="py-3.5"
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-center text-white font-bold text-base">
                        Register
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center">
                  <Text className="text-gray-600">
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate(ROUTES.LOGIN)}
                    className="py-2"
                  >
                    <Text className="text-blue-500 font-bold">Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;
