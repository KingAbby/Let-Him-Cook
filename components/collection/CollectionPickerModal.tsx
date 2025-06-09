import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';

interface Collection {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface Recipe {
    id: string;
    title: string;
    description: string | null;
    prep_time: number | null;
    cook_time: number | null;
    servings: string | null;
    category: string | null;
    image_url: string | null;
    created_at: string | null;
}

interface CollectionPickerModalProps {
    visible: boolean;
    recipe: Recipe | null;
    onClose: () => void;
    onSuccess?: () => void;
}

const CollectionPickerModal: React.FC<CollectionPickerModalProps> = ({
    visible,
    recipe,
    onClose,
    onSuccess,
}) => {
    const { user } = useAuth();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState<string | null>(null);

    // Fetch user collections
    const fetchCollections = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('mycollection')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCollections(data || []);
        } catch (error) {
            console.error('Error fetching collections:', error);
            Alert.alert('Error', 'Failed to load collections');
        } finally {
            setLoading(false);
        }
    };

    // Add recipe to collection
    const addToCollection = async (collectionId: string) => {
        if (!recipe || !user) return;

        try {
            setAdding(collectionId);

            // Check if recipe already exists in collection
            const { data: existing, error: checkError } = await supabase
                .from('collection_recipes')
                .select('id')
                .eq('collection_id', collectionId)
                .eq('recipe_id', recipe.id)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existing) {
                Alert.alert('Info', 'This recipe is already in the selected collection');
                return;
            }

            // Add recipe to collection
            const { error: insertError } = await supabase
                .from('collection_recipes')
                .insert({
                    collection_id: collectionId,
                    recipe_id: recipe.id,
                });

            if (insertError) throw insertError;

            const selectedCollection = collections.find(c => c.id === collectionId);
            Alert.alert(
                'Success',
                `Recipe "${recipe.title}" has been added to "${selectedCollection?.name}" collection`
            );

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error adding recipe to collection:', error);
            Alert.alert('Error', 'Failed to add recipe to collection');
        } finally {
            setAdding(null);
        }
    };

    // Load collections when modal opens
    useEffect(() => {
        if (visible) {
            fetchCollections();
        }
    }, [visible, user]);

    const renderCollectionItem = ({ item }: { item: Collection }) => (
        <TouchableOpacity
            className='bg-white p-4 mb-3 rounded-xl border border-gray-200 flex-row items-center justify-between'
            onPress={() => addToCollection(item.id)}
            disabled={adding === item.id}
            style={{
                opacity: adding === item.id ? 0.6 : 1,
            }}
        >
            <View className='flex-1'>
                <Text className='font-semibold text-gray-800 text-base mb-1'>
                    {item.name}
                </Text>
                {item.description && (
                    <Text className='text-gray-500 text-sm' numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
            </View>

            <View className='ml-3'>
                {adding === item.id ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                    <Ionicons
                        name='add-circle-outline'
                        size={24}
                        color='#3B82F6'
                    />
                )}
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View className='items-center py-12'>
            <Ionicons
                name='library-outline'
                size={64}
                color='#D1D5DB'
            />
            <Text className='text-gray-500 text-lg font-medium mt-4 text-center'>
                No Collections Yet
            </Text>
            <Text className='text-gray-400 text-center mt-2'>
                Create your first collection to organize recipes
            </Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className='flex-1 bg-gray-50'>
                {/* Header */}
                <View className='bg-white border-b border-gray-200 pt-12 pb-4 px-4'>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-xl font-bold text-gray-800'>
                            Add to Collection
                        </Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className='p-2'
                        >
                            <Ionicons name='close' size={24} color='#6B7280' />
                        </TouchableOpacity>
                    </View>

                    {recipe && (
                        <View className='mt-3 p-3 bg-blue-50 rounded-lg'>
                            <Text className='font-medium text-blue-800'>
                                {recipe.title}
                            </Text>
                            {recipe.description && (
                                <Text className='text-blue-600 text-sm mt-1' numberOfLines={2}>
                                    {recipe.description}
                                </Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Content */}
                <View className='flex-1 px-4 py-4'>
                    {loading ? (
                        <View className='flex-1 items-center justify-center'>
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text className='text-gray-500 mt-2'>Loading collections...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={collections}
                            renderItem={renderCollectionItem}
                            keyExtractor={(item) => item.id}
                            ListEmptyComponent={renderEmptyState}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default CollectionPickerModal;
