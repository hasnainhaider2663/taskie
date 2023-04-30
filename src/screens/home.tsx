import React, {Component} from 'react';

import AudioRecorder from '../components/recorder';
import {View} from 'react-native';

class HomeScreen extends Component<{navigation: any}> {
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F5FCFF',
          width: '100%',
        }}>
        <AudioRecorder />
      </View>
    );
  }
}

export default HomeScreen;
