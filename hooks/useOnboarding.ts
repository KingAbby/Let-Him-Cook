import { useState, useRef, useEffect } from 'react';
import { Animated, Dimensions } from 'react-native';
import { ONBOARDING_DATA, ONBOARDING_SETTINGS } from '../constants/onboarding';
import { OnboardingService } from '../services/OnboardingService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const useOnboarding = (onComplete: () => void) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Auto slide functionality (optional)
  useEffect(() => {
    if (ONBOARDING_SETTINGS.enableAutoSlide) {
      const interval = setInterval(() => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
          handleNext();
        }
      }, ONBOARDING_SETTINGS.autoSlideInterval);

      return () => clearInterval(interval);
    }
  }, [currentIndex]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        setCurrentIndex(index);
      },
    }
  );

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      // Animate transition
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: ONBOARDING_SETTINGS.animationDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: ONBOARDING_SETTINGS.animationDuration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => {
        flatListRef.current?.scrollToIndex({ 
          index: currentIndex + 1, 
          animated: true 
        });
        
        // Animate back
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: ONBOARDING_SETTINGS.animationDuration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: ONBOARDING_SETTINGS.animationDuration / 2,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await OnboardingService.completeOnboarding();
      await OnboardingService.markNotFirstTime();
      
      // Add completion timestamp for analytics
      const timestamp = new Date().toISOString();
      // You can save this for analytics purposes
      
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
      onComplete();
    }
  };

  return {
    currentIndex,
    scrollX,
    flatListRef,
    fadeAnim,
    scaleAnim,
    handleScroll,
    handleNext,
    handleSkip,
    handleComplete,
  };
};
