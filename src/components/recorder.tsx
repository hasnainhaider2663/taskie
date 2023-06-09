import React, { Component } from "react";
import { Animated, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AudioRecorderPlayer, {
  AudioSet,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AVLinearPCMBitDepthKeyIOSType,
  AVModeIOSOption
} from "react-native-audio-recorder-player";
import RNFS from "react-native-fs";
import firestore from "@react-native-firebase/firestore";
import uploadAudio from "../helpers/upload-audio";
import Icon from "react-native-vector-icons/Ionicons";
import StatusMessages from "../models/StatusMessages";

const { width } = Dimensions.get("window");
type State = {
  isRecording: boolean;
  isPlaying: boolean;
  audioPath: string;
  firebaseFileName: string;
  user?: any;
  firebasePath?: string;
  doc?: any;
  scale: any;
  timestamp: any;
};

interface Props {

  firebasePath?: string;
  user: any;
  embedded?: boolean;
  isDark?: boolean;

}

class AudioRecorder extends Component<Props, State> {
  unsubscribeAuth: any;
  private audioRecorderPlayer: AudioRecorderPlayer;

  constructor(props: Props) {
    super(props);

    const timestamp = new Date().getTime();
    const firebasePath = this.props.firebasePath || `${this.props.user.uid}_${timestamp}`;
    const firebaseFileName = `${firebasePath}/${timestamp}.m4a`;
    this.state = {
      isRecording: false,
      isPlaying: false,
      audioPath: "abc.m4a",
      firebasePath,
      firebaseFileName,
      doc: { status: StatusMessages.INITIAL },
      scale: new Animated.Value(1),
      timestamp, user: this.props.user
    };
    this.audioRecorderPlayer = new AudioRecorderPlayer();
  }

  animateScale = () => {
    Animated.sequence([
      Animated.timing(this.state.scale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(this.state.scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
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
  handleRecordPressIn = async () => {
    this.animateScale();
    await this.startRecording();
  };

  handleRecordPressOut = async () => {
    this.animateScale();
    await this.stopRecording();
  };

  render() {
    const buttonSize = width * 0.25;
    const iconSize = buttonSize * 0.5;

    const animatedStyle = {
      transform: [{ scale: this.state.scale }]
    };
    const styles = dynamicStyles(this.props.isDark);
    return (
      <View style={styles.container}>
        {!this.props.embedded && <View style={styles.mainContainer}>
          <Text
            style={styles.docText}>{this.state.doc.status !== StatusMessages.DONE ? this.state.doc.status : this.state.doc?.text}</Text>
        </View>}
        <View style={styles.outerButtonContainer}>
          <View style={styles.buttonContainer}>
            <Animated.View style={[styles.buttonShadow, animatedStyle]}>
              <TouchableOpacity
                style={[styles.button, { width: buttonSize, height: buttonSize }]}
                onPressIn={this.handleRecordPressIn}
                onPressOut={this.handleRecordPressOut}>
                <Icon
                  name={this.state.isRecording ? "stop" : "mic"}
                  size={iconSize} style={styles.icon}

                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    );
  }

  startRecording = async () => {
    this.setState({ isRecording: true });

    const fireStoreCollection = firestore()
      .collection("users")
      .doc(this.state.user.uid)
      .collection("entries");
    const firestoreDoc = fireStoreCollection.doc(this.state.firebasePath);
    if (this.props.embedded) {
      await firestoreDoc.update({
        status: StatusMessages.LISTENING
      });
    } else {
      await firestoreDoc.set({
        id: this.state.firebasePath,
        status: StatusMessages.LISTENING
      });
    }

    firestoreDoc.onSnapshot(documentSnapshot => {
      if (documentSnapshot.exists) {
        const data = documentSnapshot.data();
        this.setState({ doc: data });
      }
    });
    const audioSet: AudioSet = {
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.medium,
      AVNumberOfChannelsKeyIOS: 1,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
      AVLinearPCMBitDepthKeyIOS: AVLinearPCMBitDepthKeyIOSType.bit16,
      AVModeIOS: AVModeIOSOption.spokenaudio
    };

    // Set the path for the audio file
    const result = await this.audioRecorderPlayer.startRecorder(
      undefined,
      audioSet
    );
    this.audioRecorderPlayer.addRecordBackListener((e: any) => {
      return;
    });
  };

  stopRecording = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    const fireStoreCollection = firestore()
      .collection("users")
      .doc(this.state.user.uid)
      .collection("entries");
    const firestoreDoc = fireStoreCollection.doc(this.state.firebasePath);
    await firestoreDoc.update({
      status: StatusMessages.UPLOADING
    });
    this.setState({ isRecording: false, audioPath: result }, async () => {
      await uploadAudio(
        this.state.audioPath,
        this.state.firebaseFileName,
        this.state.user.uid
      ); // Call the uploadAudio function after updating the state


      await firestoreDoc.update({ status: StatusMessages.PROCESSING });
    });
  };
}

// Styles and other functions...


const dynamicStyles = (isDark = false) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 20, // Add some padding if needed
      backgroundColor: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(236, 239, 241, 0.7)",
    },
    outerButtonContainer: {
      // backgroundColor: isDark ? "#000" : "#ECEFF1",
      paddingTop: 30,
      width: "100%"
    },
    mainContainer: {
      marginBottom: 50,
      alignItems: "center",
    },
    playbackContainer: {
      alignItems: "center"
    },
    buttonContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 30
    },

    docText: {
      paddingTop: "100%", // Add some padding if needed
      fontSize: 48,
      color: isDark ? "#f5f5f5" : "#131313",
      fontFamily: Platform.OS === "ios" ? "Helvetica" : "Roboto",
      fontStyle: "normal",
      fontWeight: "100",
      letterSpacing: 0.6,
      textAlign: "center",
      maxWidth: "90%",
      shadowColor: isDark ? "#f5f5f5" : "#131313",
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2
    },
    button: {
      borderRadius: 1000,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: isDark ? "#f5f5f5" : "#131313"
    },
    buttonShadow: {
      borderRadius: 1000,
      backgroundColor: isDark ? "#B71C1C" : "#1976D2",
      shadowColor: "#fff",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5
    },
    icon: {
      color: "#ECEFF1"
    }

  });
};

const readFile = async (path: string, encoding: string): Promise<string> => {
  return await RNFS.readFile(path, encoding);
};
export default AudioRecorder;
