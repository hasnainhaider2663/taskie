import React, { Component } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

class EditTextControls extends Component {
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={[styles.button, styles.micButton]}>
          <Icon name="mic-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.pencilButton]}>
          <Icon name="pencil-outline" size={24} color="#333333" />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  micButton: {
    backgroundColor: 'black',
  },
  pencilButton: {
    backgroundColor: '#ececec',
  },
});

export default EditTextControls;
