import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Step as SpoonacularStep } from "../../services/SpoonacularService";

interface CookingStep {
	id?: string;
	step: number;
	description: string;
}

interface InstructionsListProps {
	steps: CookingStep[] | SpoonacularStep[];
	isSpoonacular?: boolean;
}

const InstructionsList: React.FC<InstructionsListProps> = ({
	steps,
	isSpoonacular = false,
}) => {
	if (!steps || steps.length === 0) {
		return <Text className='text-gray-500'>No instructions available</Text>;
	}
	return (
		<>
			<View className='flex-row items-center mb-4'>
				<Ionicons
					name='document-text-outline'
					size={22}
					color='#4B5563'
				/>
				<Text className='text-xl font-bold text-gray-700 ml-2'>
					Instructions
				</Text>
			</View>

			{steps.map((step, index) => (
				<View
					key={index}
					className='mb-4 bg-white p-4 rounded-lg'
				>
					<View className='flex-row items-center gap-2'>
						<View className='w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2'>
							<Text className='text-blue-600 font-bold'>
								{isSpoonacular
									? (step as SpoonacularStep).number
									: (step as CookingStep).step}
							</Text>
						</View>
						<Text className='text-gray-700 flex-1'>
							{isSpoonacular
								? (step as SpoonacularStep).step
								: (step as CookingStep).description}
						</Text>
					</View>
					{/* Equipment list if available */}
					{isSpoonacular &&
						(step as SpoonacularStep).equipment &&
						(step as SpoonacularStep).equipment.length > 0 && (
							<View className='ml-10 mt-2'>
								<Text className='text-gray-600 font-medium mb-1'>
									Equipment:
								</Text>
								<Text className='text-gray-500'>
									{(step as SpoonacularStep).equipment
										.map((e) => e.name)
										.join(", ")}
								</Text>
							</View>
						)}
				</View>
			))}
		</>
	);
};

export default InstructionsList;
