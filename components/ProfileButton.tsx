import * as React from 'react';
import { TouchableOpacity, Image, View, Text } from 'react-native';
import { useAuth } from "../context/AuthContext";

interface ProfileButtonProps {
    onPress: () => void;
}

const ProfileButton = ({ onPress }: ProfileButtonProps) => {
    const { user, signOut } = useAuth();
    const userName = user?.user_metadata?.name || "User";

    return (
        <TouchableOpacity onPress={onPress}>
            <View className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <Text className="text-white text-lg font-bold">
                    {userName.charAt(0).toUpperCase()}
                </Text>
            </View>
            {/* <Image
                source={require('../assets/sileighty vintage.png')}
                className="h-12 w-12 rounded-full"
            /> */}
        </TouchableOpacity>
    );
};

export default ProfileButton;