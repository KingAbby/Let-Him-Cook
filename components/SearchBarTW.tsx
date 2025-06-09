import React, { useState, useEffect } from "react";
import {
	View,
	TextInput,
	TouchableOpacity,
	Keyboard,
	Dimensions,
	Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SearchBarProps {
	placeholder?: string;
	value: string;
	onChangeText: (text: string) => void;
	onSubmit?: () => void;
	onClear?: () => void;
	containerClassName?: string;
	autoFocus?: boolean;
}

const SearchBarTW: React.FC<SearchBarProps> = ({
	placeholder = "Search Recipe",
	value,
	onChangeText,
	onSubmit,
	onClear,
	containerClassName,
	autoFocus = false,
}) => {
	const [isFocused, setIsFocused] = useState(false);
	const [screenWidth, setScreenWidth] = useState(
		Dimensions.get("window").width
	);
	const insets = useSafeAreaInsets();

	// Update dimensions when orientation changes
	useEffect(() => {
		const subscription = Dimensions.addEventListener("change", ({ window }) => {
			setScreenWidth(window.width);
		});

		return () => subscription?.remove();
	}, []);

	const handleClear = () => {
		onChangeText("");
		if (onClear) {
			onClear();
		}
	};

	const handleSubmitSearch = () => {
		Keyboard.dismiss();
		if (onSubmit) {
			onSubmit();
		}
	};

	// Calculate responsive sizes based on screen width
	const getResponsiveSize = (smallSize: number, largeSize: number): number => {
		if (screenWidth < 375) return smallSize;
		if (screenWidth > 768) return largeSize;

		const scale = (screenWidth - 375) / (768 - 375);
		return Math.round(smallSize + (largeSize - smallSize) * scale);
	};

	// Responsive icon sizes
	const searchIconSize = getResponsiveSize(16, 22);
	const closeIconSize = getResponsiveSize(14, 20);

	// Adjust padding to account for device size and safe area
	const horizontalPadding = getResponsiveSize(12, 20);
	return (
		<View
			className={`flex-row items-center bg-white rounded-full shadow-sm border-hairline border-blue-500 ${
				isFocused ? "shadow-md" : ""
			} ${containerClassName || ""}`}
			style={{
				paddingVertical: getResponsiveSize(8, 10),
				paddingHorizontal: horizontalPadding,
				marginHorizontal: Platform.OS === "ios" ? insets.left : 0,
				marginRight: Platform.OS === "ios" ? insets.right : 0,
			}}
		>
			<Ionicons
				name='search'
				size={searchIconSize}
				color='#9ca3af'
				style={{
					marginRight: getResponsiveSize(8, 12),
				}}
			/>
			<TextInput
				className='flex-1 text-gray-700'
				placeholder={placeholder}
				placeholderTextColor='#9ca3af'
				value={value}
				onChangeText={onChangeText}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				onSubmitEditing={handleSubmitSearch}
				returnKeyType='search'
				autoFocus={autoFocus}
				clearButtonMode='while-editing'
				style={{
					fontSize: getResponsiveSize(14, 16),
					paddingVertical: getResponsiveSize(1, 2),
				}}
			/>
			{value.length > 0 && (
				<TouchableOpacity
					onPress={handleClear}
					className='items-center justify-center'
					style={{
						padding: getResponsiveSize(4, 8),
						marginLeft: getResponsiveSize(4, 8),
					}}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Ionicons
						name='close-circle'
						size={closeIconSize}
						color='#9ca3af'
					/>
				</TouchableOpacity>
			)}
		</View>
	);
};

export default SearchBarTW;
