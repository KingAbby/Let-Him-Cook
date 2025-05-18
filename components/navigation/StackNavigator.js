import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routes';

import HomeScreen from '../../pages/HomeScreen';
import RecipeScreen from '../../pages/RecipeScreen';
import NotesScreen from '../../pages/NotesScreen';
import ProfileScreen from '../../pages/ProfileScreen';
import TestSupabase from '../../pages/testSupabase';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName={ROUTES.HOME}
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            {/* Home */}
            <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />

            {/* Recipe */}
            <Stack.Screen name={ROUTES.RECIPE} component={RecipeScreen} />

            {/* Notes */}
            <Stack.Screen name={ROUTES.NOTES} component={NotesScreen} />

            {/* Profile */}
            <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />

            {/* Test */}
            <Stack.Screen name={ROUTES.TEST_SUPABASE} component={TestSupabase} />
        </Stack.Navigator>
    );
};

export default StackNavigator;