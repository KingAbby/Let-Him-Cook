import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Platform, View, Text, TouchableOpacity } from "react-native";
import RootNavigator from "./RootNavigator";
import { AuthProvider } from "../../context/AuthContext";

const Navigation = () => {
  // Add state to track navigation ready state for better iOS handling
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Function to handle navigation state changes
  const onNavigationStateChange = (state) => {
    // You can add navigation state monitoring here if needed
    console.log('Navigation state changed');
  };

  // Error handler for the NavigationContainer
  const onNavigationError = (error) => {
    console.error('Navigation error:', error);
  };

  return (
    <AuthProvider>
      <NavigationContainer
        onReady={() => setIsNavigationReady(true)}
        onStateChange={onNavigationStateChange}
        onError={onNavigationError}
        // Adding key to force re-render on iOS when needed
        key={Platform.OS === 'ios' ? 'ios-nav' : 'default-nav'}
      >
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default Navigation;
