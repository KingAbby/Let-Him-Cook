import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import Header, { HEADER_HEIGHTS } from "../components/Header";
import SearchBarTW from "../components/SearchBarTW";
import { ROUTES } from "../components/navigation/routes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Type for navigation parameters
type RootStackParamList = {
    [ROUTES.RECIPE_DETAIL]: { recipeId: string };
    [ROUTES.NOTES]: undefined;
    [ROUTES.CREATE_COLLECTION]: undefined;
    [ROUTES.COLLECTION_DETAIL]: { collection: Collection };
    MainApp: { screen: string };
};

// Type for navigation
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Interface for Collection
interface Collection {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    recipe_count?: number;
}

const HEADER_HEIGHT = Platform.OS === "android" ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

const MyCollectionScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAuth();

    // State for collections
    const [collections, setCollections] = useState<Collection[]>([]);
    const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);

    // Common states
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch user's collections
    const fetchCollections = async () => {
        if (!user) return;

        try {
            // First, get all collections
            const { data: collectionsData, error: collectionsError } = await supabase
                .from('mycollection')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (collectionsError) throw collectionsError;

            // Then, get recipe counts for each collection
            const collectionsWithCount = await Promise.all(
                (collectionsData || []).map(async (collection) => {
                    const { count, error: countError } = await supabase
                        .from('collection_recipes')
                        .select('*', { count: 'exact', head: true })
                        .eq('collection_id', collection.id);

                    if (countError) {
                        console.error('Error counting recipes for collection:', collection.id, countError);
                    }

                    return {
                        ...collection,
                        recipe_count: count || 0
                    };
                })
            );

            setCollections(collectionsWithCount);
            setFilteredCollections(collectionsWithCount);
        } catch (error) {
            console.error("Error fetching collections:", error);
        }
    };

    // Fetch data on component mount and whenever screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchCollections().finally(() => setLoading(false));
            return () => { };
        }, [user])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCollections();
        setRefreshing(false);
    };

    // Search handler
    const handleSearch = (text: string) => {
        setSearchQuery(text);

        if (text.trim() === "") {
            setFilteredCollections(collections);
        } else {
            const filtered = collections.filter(collection =>
                collection.name.toLowerCase().includes(text.toLowerCase()) ||
                (collection.description && collection.description.toLowerCase().includes(text.toLowerCase()))
            );
            setFilteredCollections(filtered);
        }
    };

    // Navigation to collection detail (placeholder)
    const handleOpenCollection = (collection: Collection) => {
        navigation.navigate(ROUTES.COLLECTION_DETAIL, { collection });
    };

    const handleDeleteCollection = (collectionId: string, collectionName: string) => {
        Alert.alert(
            "Delete Collection",
            `Are you sure you want to delete "${collectionName}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteCollection(collectionId),
                },
            ]
        );
    };

    const deleteCollection = async (collectionId: string) => {
        try {
            const { error } = await supabase
                .from('mycollection')
                .delete()
                .eq('id', collectionId)
                .eq('user_id', user?.id);

            if (error) throw error;

            // Refresh collections after delete
            await fetchCollections();

            Alert.alert("Success", "Collection deleted successfully");
        } catch (error) {
            console.error("Error deleting collection:", error);
            Alert.alert("Error", "Failed to delete collection");
        }
    };

    // Render collection item
    const renderCollectionItem = ({ item }: { item: Collection }) => (
        <TouchableOpacity
            onPress={() => handleOpenCollection(item)}
            onLongPress={() => handleDeleteCollection(item.id, item.name)}
            className="bg-white rounded-xl shadow-sm p-4 mx-4 mb-3"
        >
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800 mb-1">
                        {item.name}
                    </Text>
                    {item.description && (
                        <Text className="text-gray-600 mb-2" numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                    <Text className="text-sm text-gray-400">
                        {item.recipe_count || 0} recipes
                    </Text>
                </View>
                <View className="ml-3 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => handleDeleteCollection(item.id, item.name)}
                        className="w-8 h-8 bg-red-100 rounded-full items-center justify-center mr-2"
                    >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                    <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center">
                        <Ionicons name="folder" size={24} color="#3B82F6" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    // Empty state component for no collections at all
    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center px-6 py-12">
            <View className="items-center">
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="folder-outline" size={40} color="#9CA3AF" />
                </View>
                <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
                    No Collections Yet
                </Text>
                <Text className="text-gray-500 text-center mb-6 leading-5">
                    Create your first collection to organize your recipes by categories, occasions, or any way you like!
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate(ROUTES.CREATE_COLLECTION)}
                    className="bg-blue-500 px-6 py-3 rounded-lg flex-row items-center"
                >
                    <Ionicons name="add" size={20} color="white" />
                    <Text className="text-white font-medium ml-2">Add New Collection</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Empty state component for when search fields no results
    const renderSearchEmptyState = () => (
        <View className="flex-1 items-center justify-center px-6 py-12">
            <View className="items-center">
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="folder-outline" size={40} color="#9CA3AF" />
                </View>
                <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
                    No Collections Found
                </Text>
                <Text className="text-gray-500 text-center leading-5">
                    No collections match your search for "{searchQuery}"
                </Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="dark-content"
            />
            <Header title="Collections" showBackButton={true} showBookmark={false} />

            {/* Search Bar */}
            <View
                style={{
                    position: "absolute",
                    top: HEADER_HEIGHT,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    backgroundColor: "#f9fafb",
                }}
            >
                <View className="px-4 py-4">
                    <SearchBarTW
                        placeholder="Search collections..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        onClear={() => handleSearch("")}
                        containerClassName="w-full border border-gray-200"
                    />
                </View>
                <View className="h-2 bg-gradient-to-b from-gray-100 to-transparent" />
            </View>

            {/* Main Content */}
            {loading ? (
                <View
                    className="flex-1 items-center justify-center"
                    style={{ paddingTop: HEADER_HEIGHT + 80 }}
                >
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : (
                <FlatList
                    data={filteredCollections}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCollectionItem}
                    contentContainerStyle={{
                        paddingTop: HEADER_HEIGHT + 80,
                        paddingBottom: 100,
                        flexGrow: 1
                    }}
                    ListEmptyComponent={searchQuery.trim() ? renderSearchEmptyState : renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#3b82f6"]}
                            tintColor={"#3b82f6"}
                            progressViewOffset={HEADER_HEIGHT + 80}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Floating Action Button - Show only when there are collections */}
            {collections.length > 0 && (
                <TouchableOpacity
                    className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                    onPress={() => navigation.navigate(ROUTES.CREATE_COLLECTION)}
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                    }}
                >
                    <Ionicons name="add" size={30} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default MyCollectionScreen;