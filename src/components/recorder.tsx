import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import { firebaseConfig } from '../../FirebaseConfig';

type State = {
  isRecording: boolean;
  isPlaying: boolean;
  audioPath: string | null;
  filename: string,
  user?: any;
};

class AudioRecorder extends Component<{}, State> {
  unsubscribeAuth: any;
  private audioRecorderPlayer: AudioRecorderPlayer;

  constructor(props: {}) {
    super(props);
    this.state = {
      isRecording: false,
      isPlaying: false,
      audioPath: null,
      filename: 'abc.m4a',
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
    const uniqueFilename = `${this.state.user.uid}_audioFile_${timestamp}.m4a`;
    this.setState({ filename: uniqueFilename })
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
      this.uploadAudio(); // Call the uploadAudio function after updating the state
    });
  };

  async uploadAudio() {
    if (this.state.audioPath) {
      const filename = this.state.filename;
      const uid = this.state.user.uid; // Replace with the appropriate user's UID
      const token = await this.getFirebaseStorageToken(uid);
      console.log('token', token)
      if (!token) {
        console.error('Failed to get Firebase Storage token');
        return;
      }

      try {
        const url = `https://firebasestorage.googleapis.com/v0/b/taskie-38162.appspot.com/o?uploadType=media&name=${encodeURIComponent(filename)}`;
        const data = new FormData();
        data.append('file', {
          uri: this.state.audioPath,
          type: 'audio/m4a',
          name: filename,
        });
        console.log('url', url)
        console.log('data', data)

        const result = await axios.post(url, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('File uploaded successfully', result);
      } catch (error) {
        console.error('Error uploading file:', JSON.stringify(error, null, 2));
      }
    }
  }

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

  async getFirebaseStorageToken(uid: string) {
    try {
      const response = await axios.get(
        `https://us-central1-taskie-38162.cloudfunctions.net/generateToken?uid=${uid}`,
      );
      return response.data.token;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }
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
