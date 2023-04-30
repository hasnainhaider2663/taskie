import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import { firebaseConfig } from '../../FirebaseConfig';
import firestore from '@react-native-firebase/firestore';

const getFirebaseStorageToken = async (uid: string) => {
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

export default getFirebaseStorageToken;