import React, {Component} from 'react';
import {Button, View, Text} from 'react-native';
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
            <Button
              title={this.state.isRecording ? 'Stop Recording' : 'Start Recording'}
              onPress={this.state.isRecording ? this.stopRecording : this.startRecording}
            />
            <Button
              title={this.state.isPlaying ? 'Stop Playback' : 'Start Playback'}
              onPress={this.state.isPlaying ? this.stopPlayback : this.startPlayback}
              disabled={!this.state.audioPath}
            />
            <Text>
              {this.state.isRecording ? 'Recording in progress...' : this.state.isPlaying ? 'Playing...' : ''}
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
      const result = await this.audioRecorderPlayer.startPlayer(this.state.audioPath);
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
  export default AudioRecorder;
