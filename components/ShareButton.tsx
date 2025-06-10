import React from "react";
import {
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shareRecipeAsPDF } from "../utils/pdfGenerator";

interface ShareButtonProps {
	recipe: any;
	size?: number;
	color?: string;
	style?: any;
	className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
	recipe,
	size = 24,
	color = "#3B82F6",
	style = {},
	className = "",
}) => {
	const [isSharing, setIsSharing] = React.useState(false);

	const handleShare = async () => {
		try {
			setIsSharing(true);
			await shareRecipeAsPDF(recipe);
		} catch (error) {
			console.error("Failed to share recipe:", error);
			Alert.alert(
				"Sharing Failed",
				"There was a problem sharing this recipe. Please try again later.",
				[{ text: "OK" }]
			);
		} finally {
			setIsSharing(false);
		}
	};

	return (
		<TouchableOpacity
			onPress={handleShare}
			style={[styles.button, style]}
			className={className}
			disabled={isSharing}
		>
			{isSharing ? (
				<ActivityIndicator
					size='small'
					color={color}
				/>
			) : (
				<Ionicons
					name='share-social-outline'
					size={size}
					color={color}
				/>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		padding: 8,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default ShareButton;
