import React from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DotsIndicatorProps {
    data: any[];
    scrollX: Animated.Value;
    activeColor?: string;
    inactiveColor?: string;
    size?: 'sm' | 'md' | 'lg';
}

const DotsIndicator: React.FC<DotsIndicatorProps> = ({
    data,
    scrollX,
    activeColor = '#3B82F6',
    inactiveColor = '#D1D5DB',
    size = 'md',
}) => {
    // Tailwind-based size configurations
    const sizeConfig = {
        sm: { dotClass: 'w-1.5 h-1.5', spacing: 'mx-1' },
        md: { dotClass: 'w-2 h-2', spacing: 'mx-1.5' },
        lg: { dotClass: 'w-3 h-3', spacing: 'mx-2' },
    };

    const { dotClass, spacing } = sizeConfig[size];

    return (
        <View className="flex-row justify-center items-center mb-8">
            {data.map((_, index) => {
                const opacity = scrollX.interpolate({
                    inputRange: [
                        (index - 1) * SCREEN_WIDTH,
                        index * SCREEN_WIDTH,
                        (index + 1) * SCREEN_WIDTH,
                    ],
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                });

                const scale = scrollX.interpolate({
                    inputRange: [
                        (index - 1) * SCREEN_WIDTH,
                        index * SCREEN_WIDTH,
                        (index + 1) * SCREEN_WIDTH,
                    ],
                    outputRange: [0.8, 1.2, 0.8],
                    extrapolate: 'clamp',
                });

                const backgroundColor = scrollX.interpolate({
                    inputRange: [
                        (index - 1) * SCREEN_WIDTH,
                        index * SCREEN_WIDTH,
                        (index + 1) * SCREEN_WIDTH,
                    ],
                    outputRange: [inactiveColor, activeColor, inactiveColor],
                    extrapolate: 'clamp',
                });

                return (
                    <Animated.View
                        key={index}
                        className={`rounded-full ${dotClass} ${spacing}`}
                        style={{
                            opacity,
                            transform: [{ scale }],
                            backgroundColor,
                        }}
                    />
                );
            })}
        </View>
    );
};

export default DotsIndicator;
