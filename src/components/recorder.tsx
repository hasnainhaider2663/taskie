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
  };
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
          {this.state.doc.status === 'done' ? (
            <View style={styles.playbackContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  this.state.isPlaying ? styles.stopButton : styles.playButton,
                ]}
                onPress={
                  this.state.isPlaying ? this.stopPlayback : this.startPlayback
                }
                disabled={!this.state.audioPath}>
                {this.state.isPlaying ? (
                  <Icon name="stop" size={24} color="#FFF" />
                ) : (
                  <Icon name="play" size={24} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
        <View style={styles.outerButtonContainer}>
          <View style={styles.buttonContainer}>
            <Animated.View style={[styles.buttonShadow, animatedStyle]}>
              <TouchableOpacity
                style={[styles.button, { width: buttonSize, height: buttonSize }]}
                onPress={this.handleRecordPress}>
                <Icon
                  name={this.state.isRecording ? 'stop' : 'mic'}
                  size={iconSize}
                  color="#FFF"
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
                  text: `Hello ${user.displayName?.split(' ')[0]}! \n Tap the mic to start speaking and talk to me about your tasks or just record notes`,
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

  startPlayback = async () => {
    if (this.state.audioPath) {
      this.setState({ isPlaying: true });
      const result = await this.audioRecorderPlayer.startPlayer(
        this.state.audioPath,
      );
      this.audioRecorderPlayer.addPlayBackListener((e: any) => {
        if (e.current_position === e.duration) {
          this.stopPlayback();
        }
        return;
      });
    }
  };

  stopPlayback = async () => {
    await this.audioRecorderPlayer.stopPlayer();
    this.audioRecorderPlayer.removePlayBackListener();
    this.setState({ isPlaying: false });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    width: '100%',
  },
  outerButtonContainer: {
    backgroundColor: '#f5f5f5',
    paddingTop: 30,
    width: '100%',
  },
  mainContainer: {
    marginBottom: 50,
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
    backgroundColor: '#000',
    shadowColor: '#000',
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
    color: '#fff',
    fontSize: 18,
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
  docText: {
    marginTop: 20,
    fontSize: 26,
    color: '#2D2D2D',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'Roboto',
    fontStyle: 'normal',
    fontWeight: '200',
    letterSpacing: 0.6,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

const readFile = async (path: string, encoding: string): Promise<string> => {
  return await RNFS.readFile(path, encoding);
};
export default AudioRecorder;
