import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import { firebaseConfig } from '../../FirebaseConfig';
import firestore from '@react-native-firebase/firestore';
import getFirebaseStorageToken from '../helpers/get-firebase-token'
import uploadAudio from '../helpers/upload-audio';
type State = {
  isRecording: boolean;
  isPlaying: boolean;
  audioPath: string;
  filename: string,
  user?: any,
  firebasePath?: string,
  doc?: any
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
      filename: 'abc.m4a'
    };
    this.audioRecorderPlayer = new AudioRecorderPlayer();
  }

  render() {
    return (
      <View>
        <TouchableOpacity
          style={styles.button}
          onPress={
            this.state.isRecording ? this.stopRecording : this.startRecording
          }>
          <Text style={styles.buttonText}>
            {this.state.isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={
            this.state.isPlaying ? this.stopPlayback : this.startPlayback
          }
          disabled={!this.state.audioPath}>
          <Text style={styles.buttonText}>
            {this.state.isPlaying ? 'Stop Playback' : 'Start Playback'}
          </Text>
        </TouchableOpacity>
        <Text>
          {this.state.isRecording
            ? 'Recording in progress...'
            : this.state.isPlaying
              ? 'Playing...'
              : ''}
        </Text>

        <Text>{this.state.doc?.status} : {this.state.doc?.text}</Text>
      </View>
    );
  }

  componentDidMount(): void {
    // Check if user is logged in
    this.unsubscribeAuth = auth().onAuthStateChanged(user => {
      console.log('----');
      console.log('auth state changed');

      if (user) {
        this.setState({ user });

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
    this.setState({ filename: uniqueFilename, firebasePath })

    console.log('document id for recording', uniqueFilename)
    const fireStoreCollection = firestore()
      .collection('users').doc(this.state.user.uid)
      .collection('recordings');
    const firestoreDoc = fireStoreCollection.doc(firebasePath);
    firestoreDoc.set({ id: firebasePath, status: 'loading' })
    firestoreDoc.onSnapshot(documentSnapshot => {
      console.log('doc exists: ', documentSnapshot.exists);

      if (documentSnapshot.exists) {
        const data = documentSnapshot.data();
        this.setState({ doc: data })
        console.log('doc data: ', data);
      }
    });


    // Set the path for the audio file
    const result = await this.audioRecorderPlayer.startRecorder(this.state.filename);
    this.audioRecorderPlayer.addRecordBackListener((e: any) => {
      return;
    });
  };

  stopRecording = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    this.setState({ isRecording: false, audioPath: result }, () => {
      uploadAudio(this.state.audioPath, this.state.filename, this.state.user.uid); // Call the uploadAudio function after updating the state
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
  button: {
    backgroundColor: 'red',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'black',
    paddingHorizontal: 30,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
const readFile = async (path: string, encoding: string): Promise<string> => {
  return await RNFS.readFile(path, encoding);
};
export default AudioRecorder;
