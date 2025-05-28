import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../components/navigation/routes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const LoginScreen = ({ navigation, route }: any) => {
  const [email, setEmail] = useState(route.params?.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();

  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
  }, [route.params?.email]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    const { data, error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      if (error.message?.includes("Refresh Token Not Found")) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Login Error", error.message || "Failed to login");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <LinearGradient colors={["#f8fafc", "#f1f5f9"]} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-12">
            {/* Logo/App Name dengan Icon */}
            <View className="items-center mb-10">
              <View className="w-28 h-28 rounded-full overflow-hidden mb-5 shadow-lg">
                <LinearGradient
                  colors={["#3B82F6", "#60A5FA"]}
                  className="w-full h-full items-center justify-center"
                >
                  <Ionicons name="restaurant" size={56} color="white" />
                </LinearGradient>
              </View>
              <Text className="text-3xl font-bold text-gray-800">
                Let Him Cook
              </Text>
              <Text className="text-base text-gray-600 mt-2">
                Login to your account
              </Text>
            </View>

            {/* Form dengan Card Effect */}
            <View className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm mx-auto">
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
                  />
                </View>
              </View>

              <View className="mb-6">
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
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
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

              <TouchableOpacity
                className="w-full overflow-hidden rounded-xl shadow-md mb-4"
                onPress={handleLogin}
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
                      Login
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center">
                <Text className="text-gray-600">Don't have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.REGISTER)}
                  className="py-2"
                >
                  <Text className="text-blue-500 font-bold">Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
