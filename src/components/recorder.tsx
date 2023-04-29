import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

type State = {
  isRecording: boolean;
  isPlaying: boolean;
  audioPath: string | null;
};

class AudioRecorder extends Component<{}, State> {
  private audioRecorderPlayer: AudioRecorderPlayer;

  constructor(props: {}) {
    super(props);
    this.state = {
      isRecording: false,
      isPlaying: false,
      audioPath: null,
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

  startRecording = async () => {
    this.setState({isRecording: true});
    const path = 'audioFile.m4a';
    const result = await this.audioRecorderPlayer.startRecorder(path);
    this.audioRecorderPlayer.addRecordBackListener((e: any) => {
      return;
    });
  };

  stopRecording = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    this.setState({isRecording: false, audioPath: result});
  };

  startPlayback = async () => {
    if (this.state.audioPath) {
      this.setState({isPlaying: true});
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
    this.setState({isPlaying: false});
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
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
export default AudioRecorder;
