import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons'; // For Expo, use: import { Ionicons as Icon } from '@expo/vector-icons';

const BackButton = () => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
        >
            <Icon name="arrow-back" size={30} color="#131313" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
    },
});

export default BackButton;
