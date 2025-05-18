import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons, Octicons, Foundation } from '@expo/vector-icons';
import { ROUTES } from './routes';

import HomeScreen from '../../pages/HomeScreen';
import RecipeScreen from '../../pages/RecipeScreen';
import NotesScreen from '../../pages/NotesScreen';
import ProfileScreen from '../../pages/ProfileScreen';


const Tab = createBottomTabNavigator();

export const tabBarStyle = {
    backgroundColor: '#F8F9F9',
    borderTopWidth: 0,
    zIndex: 1000
};

const BottomTabNavigator = () => {
    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        ...tabBarStyle,
                        elevation: 8,
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        shadowOffset: { height: -1, width: 0 }
                    },
                    tabBarActiveTintColor: '#1482D1',
                    tabBarInactiveTintColor: '#000000',
                    contentStyle: {
                        backgroundColor: '#F8F9F9'
                    }
                }}
            >
                <Tab.Screen
                    name={ROUTES.HOME}
                    component={HomeScreen}
                    options={{
                        tabBarIcon: ({ color, size, focused }) => (
                            focused ?
                                <Foundation name="home" size={size} color={color} /> :
                                <Octicons name="home" size={size} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name={ROUTES.RECIPE}
                    component={RecipeScreen}
                    options={{
                        tabBarIcon: ({ color, size, focused }) => (
                            focused ?
                                <MaterialCommunityIcons name="chef-hat" size={size} color={color} /> :
                                <MaterialCommunityIcons name="chef-hat" size={size - 2} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name={ROUTES.NOTES}
                    component={NotesScreen}
                    options={{
                        tabBarIcon: ({ color, size, focused }) => (
                            focused ?
                                <FontAwesome name="book" size={size} color={color} /> :
                                <FontAwesome name="book" size={size - 2} color={color} />
                        ),
                    }}
                />
                < Tab.Screen
                    name={ROUTES.PROFILE}
                    component={ProfileScreen}
                    options={{
                        tabBarIcon: ({ color, size, focused }) => (
                            focused ?
                                <Ionicons name="person" size={size} color={color} /> :
                                <Ionicons name="person-outline" size={size} color={color} />
                        ),
                    }}
                />
            </Tab.Navigator >
        </View>
    );
};

export default BottomTabNavigator;