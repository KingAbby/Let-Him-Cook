import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./RootNavigator";
import { AuthProvider } from "../../context/AuthContext";

const Navigation = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default Navigation;
