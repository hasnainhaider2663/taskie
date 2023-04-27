import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';
import AudioRecorder from '../components/recorder';

const HomeScreen = ({navigation}) => {
  

  return (
    <View style={styles.container}>
    
      <TouchableOpacity style={styles.button} >
        <AudioRecorder></AudioRecorder>
      </TouchableOpacity>
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default HomeScreen;
