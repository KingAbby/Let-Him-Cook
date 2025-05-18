import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from './routes';
import StackNavigator from './StackNavigator';
import BottomTabNavigator from './BottomTabNavigator';

const RootStack = createStackNavigator();

const RootNavigator = () => {
    return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {/* Change this to StackNavigator if you want to start with auth screens */}
            <RootStack.Screen name="MainApp" component={BottomTabNavigator} />
            <RootStack.Screen name="Auth" component={StackNavigator} />
        </RootStack.Navigator>
    );
};

export default RootNavigator;
