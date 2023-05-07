import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import AudioRecorderPlayer, {
  AudioSet,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AVLinearPCMBitDepthKeyIOSType,
  AVModeIOSOption,
} from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import uploadAudio from '../helpers/upload-audio';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
type State = {
  isRecording: boolean;
  isPlaying: boolean;
  audioPath: string;
  filename: string;
  user?: any;
  firebasePath?: string;
  doc?: any;
  scale: any;
};

class AudioRecorder extends Component<{}, State> {
  unsubscribeAuth: any;
  private audioRecorderPlayer: AudioRecorderPlayer;

  constructor(props: {}) {
    super(props);
    this.state = {
      isRecording: false,
      isPlaying: false,
      audioPath: 'abc.m4a',
      filename: 'abc.m4a',
      doc: { blocks: [{ block: { text: `Hello!` } }] },
      scale: new Animated.Value(1),
    };
    this.audioRecorderPlayer = new AudioRecorderPlayer();
  }
  animateScale = () => {
    Animated.sequence([
      Animated.timing(this.state.scale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  handleRecordPress = async () => {
    this.animateScale();
    if (this.state.isRecording) {
      await this.stopRecording();
    } else {
      await this.startRecording();
    }
  }
  handleRecordPressIn = async () => {
    this.animateScale();
    await this.startRecording();
  }

  handleRecordPressOut = async () => {
    this.animateScale();
    await this.stopRecording();
  }
  render() {
    const buttonSize = width * 0.25;
    const iconSize = buttonSize * 0.5;

    const animatedStyle = {
      transform: [{ scale: this.state.scale }],
    };
    return (
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <Text style={styles.docText}>{this.state.doc?.blocks[0].block.text}</Text>
        </View>
        <View style={styles.outerButtonContainer}>
          <View style={styles.buttonContainer}>
            <Animated.View style={[styles.buttonShadow, animatedStyle]}>
              <TouchableOpacity
                style={[styles.button, { width: buttonSize, height: buttonSize }]}
                onPressIn={this.handleRecordPressIn}
                onPressOut={this.handleRecordPressOut}>
                <Icon
                  name={this.state.isRecording ? 'stop' : 'mic'}
                  size={iconSize} style={styles.icon}

                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    );
  }

  componentDidMount(): void {
    // Check if user is logged in
    this.unsubscribeAuth = auth().onAuthStateChanged(user => {
      console.log('----');
      console.log('auth state changed');

      if (user) {
        this.setState({
          user,
          doc: {
            blocks: [
              {
                block: {
                  text: `Hold the mic to start speaking and release to save your note.`,
                }
              }
            ],
          }
        });

        // this.props.navigation.navigate('Home')
      } else {
        this.setState({ user });
        // this.props.navigation.navigate('Login')
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribeAuth();
  }

  startRecording = async () => {
    this.setState({ isRecording: true });
    const timestamp = new Date().getTime();
    const firebasePath = `${this.state.user.uid}_audioFile_${timestamp}`;
    const uniqueFilename = firebasePath + '.m4a';
    this.setState({ filename: uniqueFilename, firebasePath });

    const fireStoreCollection = firestore()
      .collection('users')
      .doc(this.state.user.uid)
      .collection('entries');
    const firestoreDoc = fireStoreCollection.doc(firebasePath);
    await firestoreDoc.set({
      id: firebasePath,
      status: 'loading',
      blocks: [{ block: { text: 'listening...' }, type: 'text' }]
    });
    firestoreDoc.onSnapshot(documentSnapshot => {
      if (documentSnapshot.exists) {
        const data = documentSnapshot.data();
        console.log(data)
        this.setState({ doc: data });
      }
    });
    const audioSet: AudioSet = {
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.medium,
      AVNumberOfChannelsKeyIOS: 1,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
      AVLinearPCMBitDepthKeyIOS: AVLinearPCMBitDepthKeyIOSType.bit16,
      AVModeIOS: AVModeIOSOption.spokenaudio,
    };

    // Set the path for the audio file
    const result = await this.audioRecorderPlayer.startRecorder(
      this.state.filename,
      audioSet,
    );
    this.audioRecorderPlayer.addRecordBackListener((e: any) => {
      return;
    });
  };

  stopRecording = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    const fireStoreCollection = firestore()
      .collection('users')
      .doc(this.state.user.uid)
      .collection('entries');
    const firestoreDoc = fireStoreCollection.doc(this.state.firebasePath);
    await firestoreDoc.update({
      blocks: [{ block: { text: 'Loading...' }, type: 'text' }]
    });
    this.setState({ isRecording: false, audioPath: result }, async () => {
      await uploadAudio(
        this.state.audioPath,
        this.state.filename,
        this.state.user.uid,
      ); // Call the uploadAudio function after updating the state


      await firestoreDoc.update({ blocks: [{ block: { text: 'Thinking about what you said...' }, type: 'text' }] });
    });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#131313',
    width: '100%',
  },
  outerButtonContainer: {
    backgroundColor: '#131313',
    paddingTop: 30,
    width: '100%',
  },
  mainContainer: {
    marginBottom: 50,
    alignItems:"center"
  },
  playbackContainer: {
    alignItems: 'center',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonShadow: {
    borderRadius: 1000,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  button: {
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  playButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 50, // set the radius to half the button size
    width: 'auto',
    shadowColor: '#eee',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 1,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 50, // set the radius to half the button size
    shadowColor: '#eee',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 1,
  },
  buttonText: {
    color: '#131313',
    fontSize: 18,
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    color: '#131313',
  },
  docText: {
    fontSize: 26,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'Roboto',
    fontStyle: 'normal',
    fontWeight: '200',
    letterSpacing: 0.6,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: '90%',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  }, icon: { color:'#131313' }

});

const readFile = async (path: string, encoding: string): Promise<string> => {
  return await RNFS.readFile(path, encoding);
};
export default AudioRecorder;
