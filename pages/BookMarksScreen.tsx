import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  Platform,
  StatusBar,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header, { HEADER_HEIGHTS } from '../components/Header';
import { BookmarkService, BookmarkedRecipe } from '../services/BookmarkService';
import { bookmarkEventService } from '../services/BookmarkEventService';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const BookmarksScreen = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkedRecipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const headerHeight = Platform.OS === 'android' ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [user])
  );

  const loadBookmarks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userBookmarks = await BookmarkService.getUserBookmarks(user.id);
      setBookmarks(userBookmarks);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookmarks();
    setRefreshing(false);
  };

  const removeBookmark = async (recipeId: number) => {
    if (!user) return;

    try {
      const result = await BookmarkService.removeBookmark(user.id, recipeId);
      if (result.success) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.recipe_id !== recipeId));
        
        // Emit event untuk memberitahu RecipeScreen
        bookmarkEventService.emitBookmarkRemoved(recipeId);
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  // ...existing code untuk renderBookmarkCard, renderBookmarkGrid, dll...
  const renderBookmarkCard = (item: BookmarkedRecipe, index: number) => {
    return (
      <TouchableOpacity
        key={item.id}
        className="relative rounded-2xl overflow-hidden bg-white mb-4"
        style={{ 
          width: CARD_WIDTH, 
          height: 200,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
            },
            android: {
              elevation: 6,
            },
          })
        }}
      >
        <ImageBackground
          source={{ uri: item.recipe_image }}
          className="flex-1 relative"
          imageStyle={{ borderRadius: 16 }}
        >
          
          {/* Remove bookmark button - positioned at top right */}
          <TouchableOpacity
            className="absolute top-3 right-3 w-9 h-9 rounded-full justify-center items-center z-10"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
            onPress={() => removeBookmark(item.recipe_id)}
          >
            <Ionicons
              name="bookmark"
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>

          <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,1)']}
                    locations={[0, 1]}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                    }}
                  />

          {/* Recipe info - positioned at bottom */}
          <View 
            className="absolute bottom-0 left-0 right-0 rounded-b-2xl"
          >
            <View className="p-4 pt-5">
              <Text 
                className="text-white text-sm font-semibold mb-1.5 leading-tight text-center"
                numberOfLines={2}
              >
                {item.recipe_title}
              </Text>
              <View className="flex-row items-center justify-center">
                <Ionicons name="person-outline" size={12} color="#e5e7eb" />
                <Text 
                  className="text-gray-300 text-xs ml-1"
                >
                  {item.recipe_source}
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderBookmarkGrid = () => {
    const rows = [];
    for (let i = 0; i < bookmarks.length; i += 2) {
      rows.push(
        <View key={i} style={styles.row}>
          {renderBookmarkCard(bookmarks[i], i)}
          {bookmarks[i + 1] && renderBookmarkCard(bookmarks[i + 1], i + 1)}
        </View>
      );
    }
    return rows;
  };

  // ...rest of existing code...
  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <Header title="Your Favorite Recipes" showBackButton={true} />
        <View style={[styles.centerContainer, { paddingTop: headerHeight }]}>
          <Text style={styles.loginText}>Please login to view your bookmarks</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      <Header title="Your Favorite Recipes" showBackButton={true} />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1, 
          paddingTop: headerHeight + 20
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-4 pb-6">
          {loading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-500 mt-2 text-sm">Loading your bookmarks...</Text>
            </View>
          ) : bookmarks.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Ionicons name="bookmark-outline" size={64} color="#d1d5db" />
              <Text className="text-lg font-semibold text-gray-700 mt-4 mb-2">No Bookmarks Yet</Text>
              <Text className="text-sm text-gray-500 text-center px-8">
                Start bookmarking your favorite recipes to see them here
              </Text>
            </View>
          ) : (
            <View className="flex-1">
              {renderBookmarkGrid()}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
});

export default BookmarksScreen;