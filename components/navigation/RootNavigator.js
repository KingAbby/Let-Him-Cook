import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ROUTES } from "./routes";
import BottomTabNavigator from "./BottomTabNavigator";
import StackNavigator from "./StackNavigator"; // Import StackNavigator
import { useAuth } from "../../context/AuthContext";
import LoginScreen from "../../pages/LoginScreen";
import RegisterScreen from "../../pages/RegisterScreen";
import { ActivityIndicator, View } from "react-native";
import ProfileScreen from "../../pages/ProfileScreen"; // Import ProfileScreen

// Pastikan ini hanya diimpor jika file benar-benar ada
// import TestSupabase from '../../pages/testSupabase';

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <AuthStack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1482D1" />
      </View>
    );
  } return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <RootStack.Screen name="MainApp" component={BottomTabNavigator} />
          <RootStack.Screen name={"Profile"} component={ProfileScreen} />
        </>
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export default RootNavigator;
