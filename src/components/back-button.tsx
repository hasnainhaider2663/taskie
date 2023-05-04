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
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'grey',
        width: 40,
        height: 40,
        marginTop: 10,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default BackButton;
