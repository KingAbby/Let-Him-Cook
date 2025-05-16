import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Alert,
} from "react-native";
import { supabase } from "../utils/supabase";

export default function TestSupabase() {
	const [title, setTitle] = useState("");
	const [ingredients, setIngredients] = useState("");
	const [instructions, setInstructions] = useState("");
	const [cookingTime, setCookingTime] = useState("");
	const [loading, setLoading] = useState(false);

	const addRecipe = async () => {
		if (!title || !ingredients || !instructions) {
			Alert.alert("Missing fields", "Please fill in all required fields");
			return;
		}

		try {
			setLoading(true);

			const { data, error } = await supabase.from("recipes").insert([
				{
					title,
					ingredients,
					instructions,
					cooking_time: parseInt(cookingTime) || 0,
				},
			]);

			if (error) throw error;

			Alert.alert("Success", "Recipe added successfully!");
			// Clear form
			setTitle("");
			setIngredients("");
			setInstructions("");
			setCookingTime("");
		} catch (error) {
			Alert.alert("Error", error.message || "Failed to add recipe");
		} finally {
			setLoading(false);
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>Add New Recipe</Text>

			<Text style={styles.label}>Title *</Text>
			<TextInput
				style={styles.input}
				value={title}
				onChangeText={setTitle}
				placeholder='Recipe Title'
			/>

			<Text style={styles.label}>Ingredients *</Text>
			<TextInput
				style={[styles.input, styles.multilineInput]}
				value={ingredients}
				onChangeText={setIngredients}
				placeholder='List all ingredients'
				multiline
			/>

			<Text style={styles.label}>Instructions *</Text>
			<TextInput
				style={[styles.input, styles.multilineInput]}
				value={instructions}
				onChangeText={setInstructions}
				placeholder='Step by step instructions'
				multiline
			/>

			<Text style={styles.label}>Cooking Time (minutes)</Text>
			<TextInput
				style={styles.input}
				value={cookingTime}
				onChangeText={setCookingTime}
				placeholder='e.g. 30'
				keyboardType='numeric'
			/>

			<TouchableOpacity
				style={styles.button}
				onPress={addRecipe}
				disabled={loading}
			>
				<Text style={styles.buttonText}>
					{loading ? "Adding..." : "Add Recipe"}
				</Text>
			</TouchableOpacity>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 20,
		backgroundColor: "#f0f8ff",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		color: "#333",
		textAlign: "center",
	},
	label: {
		fontSize: 16,
		marginBottom: 5,
		fontWeight: "500",
	},
	input: {
		backgroundColor: "white",
		borderRadius: 5,
		padding: 10,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: "#ddd",
	},
	multilineInput: {
		height: 100,
		textAlignVertical: "top",
	},
	button: {
		backgroundColor: "#4299e1",
		padding: 15,
		borderRadius: 5,
		alignItems: "center",
		marginTop: 10,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
});
