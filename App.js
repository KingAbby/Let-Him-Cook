import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, SafeAreaView } from "react-native";
import "./global.css";
import TestSupabase from "./pages/testSupabase";

export default function App() {
	return (
		<SafeAreaView style={styles.container}>
			<View className='flex-1 bg-blue-300'>
				<TestSupabase />
				<StatusBar style='auto' />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
});
