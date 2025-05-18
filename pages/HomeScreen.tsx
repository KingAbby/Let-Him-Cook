import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Home: undefined;
    TestSupabase: undefined;
};

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Let Him Cook</Text>
            <Text style={styles.subtitle}>Find and share delicious recipes!</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('TestSupabase')}
            >
                <Text style={styles.buttonText}>Go to Test Supabase</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#ff6b6b',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default HomeScreen;