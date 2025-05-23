import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {View, Text, TextInput, TouchableOpacity, ScrollView, Alert} from 'react-native';

const CookingSteps = forwardRef((props, ref) => {
  const [steps, setSteps] = useState([
    { id: 1, text: '' }
  ]);

  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    getSteps: () => {
      // Filter out empty steps
      return steps.filter(step => step.text.trim());
    },
    resetSteps: () => {
      setSteps([{ id: 1, text: '' }]);
    }
  }));

  const addStep = () => {
    const newStep = {
      id: steps.length + 1,
      text: ''
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (id, text) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, text } : step
    ));
  };

  const removeStep = (id) => {
    if (steps.length > 1) {
      setSteps(steps.filter(step => step.id !== id));
    } else {
      Alert.alert('Peringatan', 'Minimal harus ada satu langkah');
    }
  };

  return (
    <View className="flex-1 mt-4">
      {/* Header */}
      <Text className="text-base font-semibold mb-1">
        How to Cook
      </Text>

      <ScrollView className="flex-1 bg-zinc-200 p-5 rounded-xl" showsVerticalScrollIndicator={false}>
        {/* Steps List */}
        {steps.map((step, index) => (
          <View key={step.id} className="mb-4">
            <View className="flex-row items-center mb-2">
              <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3">
                <Text className="text-white text-xs font-bold">
                  {index + 1}
                </Text>
              </View>
              <Text className="text-base font-semibold">
                Step {index + 1}
              </Text>
              {steps.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeStep(step.id)}
                  className="ml-auto"
                >
                  <Text className="text-red-500 text-sm">delete</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View className="bg-white rounded-lg border border-gray-200">
              <TextInput
                value={step.text}
                onChangeText={(text) => updateStep(step.id, text)}
                placeholder="Explain cooking steps..."
                multiline={true}
                numberOfLines={4}
                className="p-4 text-gray-700 text-base"
                style={{ textAlignVertical: 'top' }}
              />
            </View>
          </View>
        ))}

        {/* Add Step Button */}
        <TouchableOpacity
          onPress={addStep}
          className="flex-row items-center justify-center bg-white rounded-lg p-4 border border-dashed border-green-500"
        >
          <Text className="text-green-600 font-medium text-base">
            Add More Steps
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
});

export default CookingSteps;