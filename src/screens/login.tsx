import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { GoogleSignin } from 'react-native-google-signin';
// import auth from '@react-native-firebase/auth';

const LoginScreen = () => {
  // const signInWithGoogle = async () => {
  //   try {
  //     // Sign in with Google
  //     const { idToken } = await GoogleSignin.signIn();

  //     // Create a Google credential with the token
  //     const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  //     // Sign in with credential
  //     await auth().signInWithCredential(googleCredential);
  //   } catch (error) {
  //     console.error('Login failed:', error);
  //   }
  // };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login with Google</Text>
      <TouchableOpacity style={styles.button} >
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
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

export default LoginScreen;
