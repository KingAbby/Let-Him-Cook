import React from 'react';
import { TouchableOpacity, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface OnboardingButtonProps {
    title: string;
    onPress: () => void;
    color: string;
    isLastItem?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const OnboardingButton: React.FC<OnboardingButtonProps> = ({
    title,
    onPress,
    color,
    isLastItem = false,
    disabled = false,
    size = 'md',
}) => {
    const iconName = isLastItem ? "rocket-outline" : "arrow-forward-outline";

    // Size configurations - using style objects for better iOS compatibility
    const sizeConfig = {
        sm: {
            marginHorizontal: 16,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 24,
            fontSize: 16,
            iconSize: 18
        },
        md: {
            marginHorizontal: 24,
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 32,
            fontSize: 18,
            iconSize: 20
        },
        lg: {
            marginHorizontal: 32,
            borderRadius: 20,
            paddingVertical: 20,
            paddingHorizontal: 40,
            fontSize: 20,
            iconSize: 24
        },
    };

    const config = sizeConfig[size];

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className="overflow-hidden"
            style={{
                marginHorizontal: config.marginHorizontal,
                borderRadius: config.borderRadius,
                shadowColor: disabled ? '#000' : color,
                shadowOffset: { width: 0, height: disabled ? 1 : 4 },
                shadowOpacity: disabled ? 0.1 : 0.3,
                shadowRadius: disabled ? 2 : 8,
                elevation: disabled ? 2 : 6,
                opacity: disabled ? 0.6 : 1,
            }}
        >
            <LinearGradient
                colors={disabled ? ['#D1D5DB', '#9CA3AF'] : [color, color + 'CC']}
                style={{
                    paddingVertical: config.paddingVertical,
                    paddingHorizontal: config.paddingHorizontal,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text
                    className="text-white font-bold mr-2"
                    style={{
                        fontSize: config.fontSize,
                        fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
                    }}
                >
                    {title}
                </Text>
                <Ionicons
                    name={iconName}
                    size={config.iconSize}
                    color="white"
                />
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default OnboardingButton;
