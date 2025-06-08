import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY_PREFIX = '@onboarding_completed_';
const FIRST_TIME_USER_KEY = '@first_time_user';

export class OnboardingService {

  //Check if user has completed onboarding
  static async isOnboardingCompleted(userId?: string): Promise<boolean> {
    try {
      if (!userId) {
        // Fallback untuk backward compatibility
        const value = await AsyncStorage.getItem('@onboarding_completed');
        return value === 'true';
      }
      
      const key = `${ONBOARDING_KEY_PREFIX}${userId}`;
      const value = await AsyncStorage.getItem(key);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  //Mark onboarding as completed for specific user
  static async completeOnboarding(userId?: string): Promise<void> {
    try {
      if (!userId) {
        // Fallback untuk backward compatibility
        await AsyncStorage.setItem('@onboarding_completed', 'true');
        return;
      }
      
      const key = `${ONBOARDING_KEY_PREFIX}${userId}`;
      await AsyncStorage.setItem(key, 'true');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }

  //Reset onboarding status for specific user (for testing purposes)
  static async resetOnboarding(userId?: string): Promise<void> {
    try {
      if (!userId) {
        // Fallback untuk backward compatibility
        await AsyncStorage.removeItem('@onboarding_completed');
        return;
      }
      
      const key = `${ONBOARDING_KEY_PREFIX}${userId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  }

  //Check if this is a first-time user
  static async isFirstTimeUser(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(FIRST_TIME_USER_KEY);
      return value !== 'false';
    } catch (error) {
      console.error('Error checking first-time user status:', error);
      return true;
    }
  }

  //Mark user as not first-time anymore
  static async markNotFirstTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(FIRST_TIME_USER_KEY, 'false');
    } catch (error) {
      console.error('Error marking not first time:', error);
    }
  }
  
  // Get onboarding analytics data
  static async getOnboardingAnalytics(userId?: string): Promise<{
    isCompleted: boolean;
    isFirstTime: boolean;
    completedAt?: string;
  }> {
    try {
      const timestampKey = userId 
        ? `${ONBOARDING_KEY_PREFIX}${userId}_timestamp`
        : '@onboarding_completed_timestamp';
        
      const [isCompleted, isFirstTime, completedAt] = await Promise.all([
        this.isOnboardingCompleted(userId),
        this.isFirstTimeUser(),
        AsyncStorage.getItem(timestampKey)
      ]);

      return {
        isCompleted,
        isFirstTime,
        completedAt: completedAt || undefined
      };
    } catch (error) {
      console.error('Error getting onboarding analytics:', error);
      return {
        isCompleted: false,
        isFirstTime: true
      };
    }
  }
}
