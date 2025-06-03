import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import Header from '../components/Header';

const BookmarksScreen = () => {
    return (
        <>
            <Header
                title="Your Favorite Recipes"
                showBackButton={true}

            />
            <View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', padding: 16 }}>Bookmarks</Text>

            </View>
        </>
    );
}

export default BookmarksScreen;