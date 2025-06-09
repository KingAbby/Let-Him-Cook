import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    StatusBar,
    Platform,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import Header, { HEADER_HEIGHTS } from "../components/Header";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const HEADER_HEIGHT = Platform.OS === "android" ? HEADER_HEIGHTS.android : HEADER_HEIGHTS.ios;

const CreateCollectionScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { user } = useAuth();

    const [collectionName, setCollectionName] = useState("");
    const [collectionDescription, setCollectionDescription] = useState("");
    const [creating, setCreating] = useState(false);

    const handleCreateCollection = async () => {
        if (!user) return;

        if (!collectionName.trim()) {
            Alert.alert("Error", "Please enter a collection name");
            return;
        }

        try {
            setCreating(true);

            const { data, error } = await supabase
                .from('mycollection')
                .insert([
                    {
                        user_id: user.id,
                        name: collectionName.trim(),
                        description: collectionDescription.trim() || null
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            Alert.alert("Success", "Collection created successfully!", [
                {
                    text: "OK",
                    onPress: () => navigation.goBack()
                }
            ]);

        } catch (error) {
            console.error("Error creating collection:", error);
            Alert.alert("Error", "Failed to create collection");
        } finally {
            setCreating(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="dark-content"
            />
            <Header title="New Collection" showBackButton={true} showBookmark={false} />

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        paddingTop: HEADER_HEIGHT + 20,
                        paddingBottom: 40
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-col gap-6">
                        {/* Header Info */}
                        <View className="px-6 flex-col gap-2">
                            <Text className="text-2xl font-bold text-blue-500">
                                Create New Collection
                            </Text>
                            <Text className="text-gray-600 leading-5">
                                Organize your recipes by creating themed collections like "Breakfast", "Italian Cuisine", or "Quick Meals".
                            </Text>
                        </View>

                        {/* Form */}
                        <View className="px-6 flex-col gap-6">
                            {/* Collection Information */}
                            <View className="bg-white rounded-xl p-4 shadow-sm flex-col gap-4">
                                <Text className="text-lg font-bold text-gray-800">
                                    Collection Information
                                </Text>

                                <View className="flex-col gap-2">
                                    <Text className="text-gray-700 font-medium">
                                        Collection Name *
                                    </Text>
                                    <View className="flex-col gap-2">
                                        <TextInput
                                            value={collectionName}
                                            onChangeText={setCollectionName}
                                            placeholder="e.g., Breakfast Recipes, Italian Cuisine..."
                                            className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800 text-base"
                                            maxLength={100}
                                            autoFocus={true}
                                        />
                                        <Text className="text-xs text-gray-400">
                                            {collectionName.length}/100 characters
                                        </Text>
                                    </View>
                                </View>

                                {/* Collection Description */}
                                <View className="flex-col gap-2">
                                    <Text className="text-gray-700 font-medium">
                                        Description (Optional)
                                    </Text>
                                    <View className="flex-col gap-2">
                                        <TextInput
                                            value={collectionDescription}
                                            onChangeText={setCollectionDescription}
                                            placeholder="Describe what this collection is about..."
                                            multiline
                                            numberOfLines={4}
                                            className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800 text-base"
                                            style={{ textAlignVertical: 'top', minHeight: 100 }}
                                            maxLength={500}
                                        />
                                        <Text className="text-xs text-gray-400">
                                            {collectionDescription.length}/500 characters
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Preview Card */}
                            <View className="bg-white rounded-xl p-4 shadow-sm flex-col gap-2">
                                <Text className="text-lg font-bold text-gray-800">
                                    Preview
                                </Text>
                                <View className="border border-gray-200 rounded-lg p-4">
                                    <View className="flex-row gap-2 justify-between">
                                        <View className="flex-col gap-4 items-start">
                                            <View className="flex-col">
                                                <Text className="text-lg font-bold text-gray-800">
                                                    {collectionName || "Collection Name"}
                                                </Text>
                                                {(collectionDescription || !collectionName) && (
                                                    <Text className="text-gray-600" numberOfLines={2}>
                                                        {collectionDescription || "Collection description will appear here"}
                                                    </Text>
                                                )}
                                            </View>
                                            <Text className="text-sm text-gray-400">
                                                0 recipes
                                            </Text>
                                        </View>
                                        <View className="items-end">
                                            <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center">
                                                <Ionicons name="folder" size={24} color="#3B82F6" />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View className="flex-col gap-5">
                                {/* Create Button */}
                                <TouchableOpacity
                                    onPress={handleCreateCollection}
                                    disabled={creating || !collectionName.trim()}
                                    className={`${creating || !collectionName.trim()
                                        ? 'bg-gray-300'
                                        : 'bg-blue-500'
                                        } rounded-xl py-4 items-center shadow-sm`}
                                >
                                    {creating ? (
                                        <View className="flex-row gap-2 items-center">
                                            <ActivityIndicator size="small" color="white" />
                                            <Text className="text-white font-bold text-lg">
                                                Creating...
                                            </Text>
                                        </View>
                                    ) : (
                                        <View className="flex-row gap-2 items-center">
                                            <Ionicons name="add" size={20} color="white" />
                                            <Text className="text-white font-bold text-lg">
                                                Create Collection
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* Cancel Button */}
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    disabled={creating}
                                    className="bg-white border border-gray-300 rounded-xl py-4 items-center"
                                >
                                    <Text className="text-gray-600 font-medium text-lg">
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default CreateCollectionScreen;
