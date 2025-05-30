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
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../components/navigation/routes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const window = Dimensions.get("window");

const LoginScreen = ({ navigation, route }: any) => {
  const [email, setEmail] = useState(route.params?.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();

  // Track if component is mounted to avoid state updates after unmount
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    // Mark component as mounted
    setIsMounted(true);

    if (route.params?.email) {
      setEmail(route.params.email);
    }

    // Clean up function to handle unmounting
    return () => {
      setIsMounted(false);
    };
  }, [route.params?.email]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signIn(email, password);

      // Only update state if component is still mounted
      if (!isMounted) return;

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
    } catch (error) {
      // Only update state if component is still mounted
      if (isMounted) {
        setLoading(false);
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
        console.error("Login error:", error);
      }
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={["#f8fafc", "#f1f5f9"]}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: 24,
              paddingVertical: 48
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo/App Name with Icon */}
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <View style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                overflow: 'hidden',
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 5,
              }}>
                <LinearGradient
                  colors={["#3B82F6", "#60A5FA"]}
                  style={{
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons name="restaurant" size={56} color="white" />
                </LinearGradient>
              </View>
              <Text style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: 8
              }}>
                Let Him Cook
              </Text>
              <Text style={{ fontSize: 16, color: '#4b5563' }}>
                Login to your account
              </Text>
            </View>

            {/* Form with Card Effect */}
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 24,
              marginHorizontal: Platform.OS === 'ios' ? 0 : 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              {/* Email Field */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: 6
                }}>
                  Email
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#f9fafb',
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                }}>
                  <Ionicons name="mail-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 8,
                      color: '#1f2937',
                      fontSize: 16,
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none" keyboardType="email-address"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: 6
                }}>
                  Password
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#f9fafb',
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                }}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 8,
                      color: '#1f2937',
                      fontSize: 16,
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    onPress={togglePasswordVisibility}
                    style={{ padding: 8 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={{
                  overflow: 'hidden',
                  borderRadius: 12,
                  marginBottom: 16,
                  opacity: loading ? 0.7 : 1
                }}
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#3B82F6", "#60A5FA"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 14,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: 16
                    }}>
                      Login
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Register Link */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 8
              }}>
                <Text style={{ color: '#6b7280' }}>
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.REGISTER)}
                  style={{ padding: 8 }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: '#3b82f6', fontWeight: '600' }}>
                    Register
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
