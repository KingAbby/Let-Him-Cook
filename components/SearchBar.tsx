import React, { useState } from "react";
import {
	View,
	TextInput,
	TouchableOpacity,
	Platform,
	Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
	placeholder?: string;
	value: string;
	onChangeText: (text: string) => void;
	onSubmit?: () => void;
	onClear?: () => void;
	containerClassName?: string;
	autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
	placeholder = "Search Recipe",
	value,
	onChangeText,
	onSubmit,
	onClear,
	containerClassName,
	autoFocus = false,
}) => {
	const [isFocused, setIsFocused] = useState(false);

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

	return (
		<View
			className={`flex-row items-center bg-white rounded-full px-4 py-2 shadow-sm border-blue-500 ${
				isFocused ? "shadow-md" : ""
			} ${containerClassName || ""}`}
		>
			<Ionicons
				name='search'
				size={16}
				color='#9ca3af'
				className='mr-2'
			/>

			<TextInput
				className='flex-1 text-gray-800 text-base py-0.5 border-blue-500'
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
			/>

			{value.length > 0 && (
				<TouchableOpacity
					onPress={handleClear}
					className='p-1'
				>
					<Ionicons
						name='close-circle'
						size={16}
						color='#9ca3af'
					/>
				</TouchableOpacity>
			)}
		</View>
	);
};

export default SearchBar;
