// BackButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

type Props = {
    isDark: boolean;
};

const BackButton = ({ isDark }: Props) => {
    const navigation = useNavigation();
    const styles = dynamicStyles(isDark);

    return (
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={30} style={styles.icon} />
      </TouchableOpacity>
    );
};

const dynamicStyles = (isDark: boolean) => {
    return StyleSheet.create({
        button: {
            width: 40,
            height: 40,
        },
        icon: {
            color: isDark ? "#F5F5F5" : "#131313",
        },
    });
};

export default BackButton;
