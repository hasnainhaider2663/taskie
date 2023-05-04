// Details.tsx
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { TextBlock, AudioBlock, ImageBlock, VideoBlock, CheckListBlock, ChechListItem, Block, BlockType } from '../models/blocks';

type Props = {
    route: {
        params: {
            entryId: string;
        };
    };
};

type State = {
    entry: any;
    isLoading: boolean;
    user?: any;
};

class Details extends Component<Props, State> {
    unsubscribeAuth;
    constructor(props: Props) {
        super(props);
        this.state = {
            entry: null,
            isLoading: true,

        };
    }

    componentDidMount(): void {

        this.unsubscribeAuth = auth().onAuthStateChanged(user => {
            console.log('----');
            console.log('auth state changed');


            this.setState({ user });

            this.fetchEntry();

        });
    }

    componentWillUnmount() {
        this.unsubscribeAuth();
    }
    async fetchEntry() {
        const { entryId } = this.props.route.params;

        try {
            const entryRef = firestore().collection('users').doc(this.state.user.uid).collection('entries').doc(entryId);
            entryRef.onSnapshot(entryDoc => {
                if (entryDoc.exists) {
                    this.setState({
                        entry: entryDoc.data(),
                        isLoading: false,
                    });
                } else {
                    console.error('entry not found.');
                    this.setState({ isLoading: false });
                }
            });


        } catch (error) {
            console.error(error);
            this.setState({ isLoading: false });
        }
    }

    render() {
        const { isLoading, entry } = this.state;

        if (isLoading) {
            return (
                <View style={styles.container}>
                    <Text>Loading...</Text>
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <Text style={styles.title} >{entry.title}</Text>
                {entry.blocks?.map((block: Block, index: number) => (
                    <React.Fragment key={index}>{renderBlock(block)}</React.Fragment>
                ))}
            </View>
        );
    }
}
const renderBlock = (blockItem: Block) => {
    switch (blockItem.type) {
        case BlockType.TextBlock:
            return (
                <View style={styles.blockContainer}>
                    <Text style={styles.text}>{(blockItem.block as TextBlock).text}</Text>
                </View>
            );
        case BlockType.AudioBlock:
            return (
                <View style={styles.blockContainer}>
                    {/* Render your audio player component with the audio source */}
                    {/* Example: <AudioPlayer source={(block as AudioBlock).audio} /> */}
                </View>
            );
        case BlockType.ImageBlock:
            return (
                <View style={styles.blockContainer}>
                    <Image style={styles.image} source={{ uri: (blockItem.block as ImageBlock).imgUrl }} />
                </View>
            );
        case BlockType.VideoBlock:
            return (
                <View style={styles.blockContainer}>
                    {/* Render your video player component with the video source */}
                    {/* Example: <VideoPlayer source={(block as VideoBlock).videoUrl} /> */}
                </View>
            );
        case BlockType.CheckListBlock:
            return (
                <View style={styles.blockContainer}>
                    {(blockItem.block as CheckListBlock).items.map((item: ChechListItem, index: number) => (
                        <TouchableOpacity key={index} onPress={() => { }}>
                            <Text style={styles.text}>{item.text}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        default:
            return null;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5FCFF',
    },
    blockContainer: {},
    image: {},
    title: {
        fontSize: 60,
        fontWeight: 'bold'

    },
    text: {
        fontSize: 20,
    }
});

export default Details;
