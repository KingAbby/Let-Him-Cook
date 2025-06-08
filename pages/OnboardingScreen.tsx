import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Animated,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ONBOARDING_DATA, ONBOARDING_SETTINGS } from '../constants/onboarding';
import OnboardingButton from '../components/onboarding/OnboardingButton';
import DotsIndicator from '../components/onboarding/DotsIndicator';
import { useOnboarding } from '../hooks/useOnboarding';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingScreenProps {
    onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const {
        currentIndex,
        scrollX,
        flatListRef,
        fadeAnim,
        scaleAnim,
        handleScroll,
        handleNext,
        handleSkip,
    } = useOnboarding(onComplete);
    
    const renderDots = () => {
        if (!ONBOARDING_SETTINGS.showDots) return null;

        return (
            <DotsIndicator
                data={ONBOARDING_DATA}
                scrollX={scrollX}
                activeColor={ONBOARDING_DATA[currentIndex]?.color || '#3B82F6'}
                inactiveColor="#D1D5DB"
                size="md"
            />
        );
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const isLastItem = index === ONBOARDING_DATA.length - 1;

        return (
            <Animated.View
                style={{
                    width: SCREEN_WIDTH,
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }}
            >
                <LinearGradient
                    colors={['#ffffff', item.backgroundColor, '#ffffff']}
                    locations={[0, 0.6, 1]}
                    style={{
                        flex: 1,
                        paddingHorizontal: 20,
                        paddingTop: Platform.OS === 'ios' ? 60 : 40,
                    }}
                >
                    {/* Skip Button */}
                    {ONBOARDING_SETTINGS.showSkipButton && !isLastItem && (
                        <TouchableOpacity
                            onPress={handleSkip}
                            className="absolute right-6 z-10 bg-white/80 px-4 py-2 rounded-full"
                            style={{
                                marginTop: Platform.OS === 'ios' ? 40 : 20,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3,
                            }}
                        >
                            <Text className="text-gray-600 font-medium">Skip</Text>
                        </TouchableOpacity>
                    )}

                    {/* Icon/Image Section */}
                    <View className="flex-1 justify-center items-center">
                        {/* Large Icon with Animation */}
                        <Animated.View
                            className="w-32 h-32 rounded-full items-center justify-center mb-8"
                            style={{
                                backgroundColor: item.color + '20',
                                transform: [{
                                    rotate: scrollX.interpolate({
                                        inputRange: [
                                            (index - 1) * SCREEN_WIDTH,
                                            index * SCREEN_WIDTH,
                                            (index + 1) * SCREEN_WIDTH,
                                        ],
                                        outputRange: ['-30deg', '0deg', '30deg'],
                                        extrapolate: 'clamp',
                                    })
                                }]
                            }}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={64}
                                color={item.color}
                            />
                        </Animated.View>

                        {/* Title */}
                        <Animated.Text
                            className="text-3xl font-bold text-gray-800 text-center mb-4 px-4"
                            style={{
                                transform: [{
                                    translateY: scrollX.interpolate({
                                        inputRange: [
                                            (index - 1) * SCREEN_WIDTH,
                                            index * SCREEN_WIDTH,
                                            (index + 1) * SCREEN_WIDTH,
                                        ],
                                        outputRange: [50, 0, -50],
                                        extrapolate: 'clamp',
                                    })
                                }]
                            }}
                        >
                            {item.title}
                        </Animated.Text>

                        {/* Subtitle */}
                        <Animated.Text
                            className="text-xl font-semibold text-center mb-6 px-6"
                            style={{
                                color: item.color,
                                transform: [{
                                    translateY: scrollX.interpolate({
                                        inputRange: [
                                            (index - 1) * SCREEN_WIDTH,
                                            index * SCREEN_WIDTH,
                                            (index + 1) * SCREEN_WIDTH,
                                        ],
                                        outputRange: [30, 0, -30],
                                        extrapolate: 'clamp',
                                    })
                                }]
                            }}
                        >
                            {item.subtitle}
                        </Animated.Text>

                        {/* Description */}
                        <Animated.Text
                            className="text-base text-gray-600 text-center leading-6 px-8"
                            style={{
                                transform: [{
                                    translateY: scrollX.interpolate({
                                        inputRange: [
                                            (index - 1) * SCREEN_WIDTH,
                                            index * SCREEN_WIDTH,
                                            (index + 1) * SCREEN_WIDTH,
                                        ],
                                        outputRange: [20, 0, -20],
                                        extrapolate: 'clamp',
                                    })
                                }]
                            }}
                        >
                            {item.description}
                        </Animated.Text>
                    </View>

                    {/* Bottom Section */}
                    <View className="pb-12">
                        {/* Dots Indicator */}
                        {renderDots()}

                        {/* Action Button */}
                        <OnboardingButton
                            title={isLastItem ? "Get Started" : "Next"}
                            onPress={handleNext}
                            color={item.color}
                            isLastItem={isLastItem}
                        />

                        {/* Progress indicator for last screen */}
                        {isLastItem && (
                            <View className="mt-6 mx-6">
                                <Text className="text-center text-gray-500 text-sm">
                                    Join thousands of food lovers worldwide! 🍳
                                </Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <Animated.FlatList
                ref={flatListRef}
                data={ONBOARDING_DATA}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                bounces={false}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
            />
        </SafeAreaView>
    );
};

export default OnboardingScreen;