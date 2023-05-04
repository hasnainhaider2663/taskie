// Details.tsx
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

type Props = {
    route: {
        params: {
            recordingId: string;
        };
    };
};

type State = {
    recording: any;
    isLoading: boolean;
    user?: any;
};

class Details extends Component<Props, State> {
    unsubscribeAuth;
    constructor(props: Props) {
        super(props);
        this.state = {
            recording: null,
            isLoading: true,

        };
    }

    componentDidMount(): void {

        this.unsubscribeAuth = auth().onAuthStateChanged(user => {
            console.log('----');
            console.log('auth state changed');


            this.setState({ user });

            this.fetchRecording();

        });
    }

    componentWillUnmount() {
        this.unsubscribeAuth();
    }
    async fetchRecording() {
        const { recordingId } = this.props.route.params;

        try {
            const recordingRef = firestore().collection('users').doc(this.state.user.uid).collection('recordings').doc(recordingId);
            const recordingDoc = await recordingRef.get();

            if (recordingDoc.exists) {
                this.setState({
                    recording: recordingDoc.data(),
                    isLoading: false,
                });
            } else {
                console.error('Recording not found.');
                this.setState({ isLoading: false });
            }
        } catch (error) {
            console.error(error);
            this.setState({ isLoading: false });
        }
    }

    render() {
        const { isLoading, recording } = this.state;

        if (isLoading) {
            return (
                <View style={styles.container}>
                    <Text>Loading...</Text>
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <Text>{recording.title}</Text>
                {/* Display other recording details here */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
});

export default Details;
