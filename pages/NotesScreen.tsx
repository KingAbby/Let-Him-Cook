import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface Ingredient {
  id: string;
  amount: string;
  unit: string;
  name: string;
}

interface CookingStep {
  id: string;
  step: number;
  description: string;
}

const NotesScreen = () => {
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [cookTime, setCookTime] = useState('30');
  const [servings, setServings] = useState('2-4');
  const [difficulty, setDifficulty] = useState('Mudah');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', amount: '', unit: '', name: '' },
    { id: '2', amount: '', unit: '', name: '' },
    { id: '3', amount: '', unit: '', name: '' },
  ]);

  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([
    { id: '1', step: 1, description: '' },
    { id: '2', step: 2, description: '' },
    { id: '3', step: 3, description: '' },
  ]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const addIngredient = () => {
    const newId = (ingredients.length + 1).toString();
    setIngredients([
      ...ingredients,
      { id: newId, amount: '', unit: '', name: '' }
    ]);
  };

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(ing => ing.id !== id));
    }
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setIngredients(ingredients.map(ing => 
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const addCookingStep = () => {
    const newId = (cookingSteps.length + 1).toString();
    setCookingSteps([
      ...cookingSteps,
      { id: newId, step: cookingSteps.length + 1, description: '' }
    ]);
  };

  const updateCookingStep = (id: string, description: string) => {
    setCookingSteps(cookingSteps.map(step => 
      step.id === id ? { ...step, description } : step
    ));
  };

  const saveRecipe = () => {
    if (!recipeName.trim()) {
      Alert.alert('Error', 'Nama masakan harus diisi');
      return;
    }
    
    // Implement save logic here
    Alert.alert('Berhasil', 'Resep berhasil disimpan');
  };

  const DifficultyButton = ({ level, isSelected, onPress }: { level: string; isSelected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full border ${
        isSelected 
          ? 'bg-green-100 border-green-500' 
          : 'bg-gray-100 border-gray-300'
      }`}
    >
      <Text className={`text-sm ${isSelected ? 'text-green-700' : 'text-gray-600'}`}>
        {level}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Text className="text-lg font-semibold">Tambah Resep</Text>
        <TouchableOpacity onPress={saveRecipe}>
          <Text className="text-green-600 font-medium">Simpan</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image Upload */}
        <TouchableOpacity 
          onPress={pickImage}
          className="mx-4 mt-4 h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 justify-center items-center"
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="w-full h-full rounded-lg" />
          ) : (
            <View className="items-center">
              <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2">Tambah Foto Masakan</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Recipe Name */}
        <View className="mx-4 mt-6">
          <Text className="text-gray-700 font-medium mb-2">Nama Masakan</Text>
          <TextInput
            value={recipeName}
            onChangeText={setRecipeName}
            placeholder="Contoh: Nasi Goreng Spesial"
            className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200"
          />
        </View>

        {/* Description */}
        <View className="mx-4 mt-4">
          <Text className="text-gray-700 font-medium mb-2">Deskripsi</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Ceritakan tentang resep masakan Anda"
            multiline
            numberOfLines={3}
            className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200"
            textAlignVertical="top"
          />
        </View>

        {/* Time and Servings */}
        <View className="mx-4 mt-4 flex-row">
          <View className="flex-1 mr-2">
            <Text className="text-gray-700 font-medium mb-2">Waktu Persiapan</Text>
            <View className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex-row items-center">
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <TextInput
                value={prepTime}
                onChangeText={setPrepTime}
                className="ml-2 flex-1"
                keyboardType="numeric"
              />
              <Text className="text-gray-500">menit</Text>
            </View>
          </View>
          
          <View className="flex-1 ml-2">
            <Text className="text-gray-700 font-medium mb-2">Waktu Memasak</Text>
            <View className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex-row items-center">
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <TextInput
                value={cookTime}
                onChangeText={setCookTime}
                className="ml-2 flex-1"
                keyboardType="numeric"
              />
              <Text className="text-gray-500">menit</Text>
            </View>
          </View>
        </View>

        {/* Servings */}
        <View className="mx-4 mt-4">
          <Text className="text-gray-700 font-medium mb-2">Porsi</Text>
          <View className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex-row items-center">
            <Ionicons name="restaurant-outline" size={20} color="#6B7280" />
            <TextInput
              value={servings}
              onChangeText={setServings}
              placeholder="2-4 porsi"
              className="ml-2 flex-1"
            />
          </View>
        </View>

        {/* Ingredients */}
        <View className="mx-4 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold">Bahan-bahan</Text>
            <TouchableOpacity 
              onPress={addIngredient}
              className="flex-row items-center"
            >
              <Ionicons name="add-circle" size={20} color="#10B981" />
              <Text className="text-green-600 font-medium ml-1">Tambah Bahan</Text>
            </TouchableOpacity>
          </View>

          {ingredients.map((ingredient, index) => (
            <View key={ingredient.id} className="flex-row items-center mb-3">
              <View className="w-16 bg-gray-50 px-2 py-2 rounded border border-gray-200 mr-2">
                <TextInput
                  value={ingredient.amount}
                  onChangeText={(value) => updateIngredient(ingredient.id, 'amount', value)}
                  placeholder="100"
                  className="text-center text-sm"
                  keyboardType="numeric"
                />
              </View>
              
              <View className="w-20 bg-gray-50 px-2 py-2 rounded border border-gray-200 mr-2">
                <TextInput
                  value={ingredient.unit}
                  onChangeText={(value) => updateIngredient(ingredient.id, 'unit', value)}
                  placeholder="gram"
                  className="text-center text-sm"
                />
              </View>
              
              <View className="flex-1 bg-gray-50 px-3 py-2 rounded border border-gray-200 mr-2">
                <TextInput
                  value={ingredient.name}
                  onChangeText={(value) => updateIngredient(ingredient.id, 'name', value)}
                  placeholder="Nama bahan"
                  className="text-sm"
                />
              </View>

              {ingredients.length > 1 && (
                <TouchableOpacity 
                  onPress={() => removeIngredient(ingredient.id)}
                  className="p-1"
                >
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Cooking Steps */}
        <View className="mx-4 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold">Cara Memasak</Text>
            <TouchableOpacity 
              onPress={addCookingStep}
              className="flex-row items-center"
            >
              <Ionicons name="add-circle" size={20} color="#10B981" />
              <Text className="text-green-600 font-medium ml-1">Tambah Langkah</Text>
            </TouchableOpacity>
          </View>

          {cookingSteps.map((step) => (
            <View key={step.id} className="flex-row mb-4">
              <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center mr-3 mt-1">
                <Text className="text-white font-bold text-sm">{step.step}</Text>
              </View>
              
              <View className="flex-1">
                <Text className="font-medium text-gray-800 mb-1">Langkah {step.step}</Text>
                <TextInput
                  value={step.description}
                  onChangeText={(value) => updateCookingStep(step.id, value)}
                  placeholder="Jelaskan langkah memasak..."
                  multiline
                  className="bg-gray-50 px-3 py-2 rounded border border-gray-200 min-h-[60px]"
                  textAlignVertical="top"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Additional Information */}
        <View className="mx-4 mt-6 mb-8">
          <Text className="text-lg font-semibold mb-4">Informasi Tambahan</Text>
          
          {/* Category */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Kategori</Text>
            <TouchableOpacity className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="restaurant" size={20} color="#6B7280" />
                <Text className="ml-2 text-gray-500">Pilih kategori</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Difficulty */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Tingkat Kesulitan</Text>
            <View className="flex-row space-x-3">
              <DifficultyButton 
                level="Mudah" 
                isSelected={difficulty === 'Mudah'} 
                onPress={() => setDifficulty('Mudah')}
              />
              <DifficultyButton 
                level="Sedang" 
                isSelected={difficulty === 'Sedang'} 
                onPress={() => setDifficulty('Sedang')}
              />
              <DifficultyButton 
                level="Sulit" 
                isSelected={difficulty === 'Sulit'} 
                onPress={() => setDifficulty('Sulit')}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotesScreen;