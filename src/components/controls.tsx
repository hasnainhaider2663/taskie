import React, { Component } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

class Controls extends Component {
    state = {
        buttonsVisible: false,
        animation: new Animated.Value(0),
    };

    handlePlusPress = () => {
        const { buttonsVisible, animation } = this.state;

        Animated.timing(animation, {
            toValue: buttonsVisible ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();

        this.setState({ buttonsVisible: !buttonsVisible });
    };

    render() {
        const { animation } = this.state;

        const cameraTranslateX = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [-60, 0],
        });
        const editButtonTranslateX = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [-120, 0],
        });
        const ListButtonTranslateX = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [-180, 0],
        });

        const plusRotate = animation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });

        const buttonOpacity = animation;

        return (
            <View style={styles.container}>
                <Animated.View
                    style={[
                        styles.button,
                        styles.plusButton,
                        { transform: [{ rotate: plusRotate }] },
                    ]}
                >
                    <TouchableOpacity onPress={this.handlePlusPress}>
                        <Icon name="add-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.buttonWrapper}>
                    <Animated.View
                        style={[
                            styles.button,
                            styles.otherButton,
                            { transform: [{ translateX: cameraTranslateX }] },
                            { opacity: buttonOpacity },
                        ]}
                    >
                        <Icon name="camera-outline" size={24} color="#333333" />
                    </Animated.View>
                </View>

                <View style={styles.buttonWrapper}>
                    <Animated.View
                        style={[
                            styles.button,
                            styles.otherButton,
                            { transform: [{ translateX: editButtonTranslateX }] },
                            { opacity: buttonOpacity },
                        ]}
                    >
                        <Icon name="pencil-outline" size={24} color="#333333" />
                    </Animated.View>
                </View>

                <View style={styles.buttonWrapper}>
                    <Animated.View
                        style={[
                            styles.button,
                            styles.otherButton,
                            { transform: [{ translateX: ListButtonTranslateX }] },
                            { opacity: buttonOpacity },
                        ]}
                    >
                        <Icon name="list-outline" size={24} color="#333333" />
                    </Animated.View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderRadius: 10,
        padding: 10,
        marginVertical: 10,
    },
    buttonWrapper: {
        marginLeft: 10,
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusButton: {
        backgroundColor: 'black',
        zIndex: 1,
    },
    otherButton: {
        backgroundColor: '#ececec',
    },
});

export default Controls;
