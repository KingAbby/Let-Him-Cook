import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import "./global.css";
import Tester from "./pages/tester";
import Hello from "./pages/hello";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-300">
      <Tester />
      <Hello />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
