import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import auth from '@react-native-firebase/auth';

class AuthLoading extends React.Component {
    constructor(props) {
        super(props);
        this.handleAuthState();
    }

    handleAuthState = () => {
        auth().onAuthStateChanged((user) => {
            if (user) {
                this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
            } else {
                this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }
        });
    };

    render() {
        return (
            <View>
                <ActivityIndicator />
            </View>
        );
    }
}

export default AuthLoading;