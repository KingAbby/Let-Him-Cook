import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform } from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons, Octicons, Foundation } from '@expo/vector-icons';
import { ROUTES } from './routes';

import HomeScreen from '../../pages/HomeScreen';
import RecipeScreen from '../../pages/RecipeScreen';
import NotesScreen from '../../pages/NotesScreen';


const Tab = createBottomTabNavigator();

export const tabBarStyle = {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.7)',
    zIndex: 1000,
    marginBottom: 0
};

const BottomTabNavigator = () => {
    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false, tabBarStyle: {
                        backgroundColor: '#FFFFFF',
                        borderTopWidth: 1,
                        borderTopColor: 'rgba(229, 231, 235, 0.7)',
                        elevation: 8,
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        shadowOffset: { height: -1, width: 0 },
                        height: 80,
                        marginBottom: 0,
                        paddingBottom: 6,
                        paddingTop: 6
                    },
                    tabBarActiveTintColor: '#3B82F6',
                    tabBarInactiveTintColor: '#64748B',
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
                            <Octicons name="home" size={focused ? 24 : 22} color={color} />
                        ),
                        tabBarLabel: ({ color, focused }) => (
                            <Text style={{
                                color,
                                fontSize: 12,
                                fontWeight: focused ? 'bold' : 'normal',
                                marginTop: -5
                            }}>
                                Home
                            </Text>
                        )
                    }}
                />
                <Tab.Screen
                    name={ROUTES.RECIPE}
                    component={RecipeScreen}
                    options={{
                        tabBarIcon: ({ color, size, focused }) => (
                            <MaterialCommunityIcons name="silverware-clean" size={focused ? 24 : 22} color={color} />
                        ),
                        tabBarLabel: ({ color, focused }) => (
                            <Text style={{
                                color,
                                fontSize: 12,
                                fontWeight: focused ? 'bold' : 'normal',
                                marginTop: -5
                            }}>
                                Recipe
                            </Text>
                        )
                    }}
                />
                <Tab.Screen
                    name={ROUTES.NOTES}
                    component={NotesScreen}
                    options={{
                        tabBarIcon: ({ color, size, focused }) => (
                            <FontAwesome name="book" size={focused ? 24 : 22} color={color} />
                        ),
                        tabBarLabel: ({ color, focused }) => (
                            <Text style={{
                                color,
                                fontSize: 12,
                                fontWeight: focused ? 'bold' : 'normal',
                                marginTop: -5
                            }}>
                                Notes
                            </Text>
                        )
                    }} />
            </Tab.Navigator>
        </View>
    );
};

export default BottomTabNavigator;