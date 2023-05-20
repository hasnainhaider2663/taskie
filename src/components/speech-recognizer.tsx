import React, { Component } from "react";
import { Animated, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Voice from "@react-native-voice/voice";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";

const { width } = Dimensions.get("window");
type State = {
  isRecording: boolean;
  user?: any;
  scale: any;
  timestamp: any;
};

interface Props {

  user: any;
  embedded?: boolean;
  isDark?: boolean;
  onSpeechResult?: (text: string) => void;
}

class SpeechRecognizer extends Component<Props, State> {
  unsubscribeAuth: any;

  constructor(props: Props) {
    super(props);

    const timestamp = new Date().getTime();
    this.state = {
      isRecording: false,
      scale: new Animated.Value(1),
      timestamp, user: this.props.user
    };
  }
  componentDidMount() {
    Voice.onSpeechResults = this.onSpeechResults;

  }
  componentWillUnmount() {
    Voice.onSpeechResults = () => {}; // assign an empty function
    Voice.stop();
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
        {/*{!this.props.embedded && <View style={styles.mainContainer}>*/}
        {/*  /!*<Text            style={styles.docText}>{this.state.doc.status !== StatusMessages.DONE ? this.state.doc.status : this.state.doc?.text}</Text>*!/*/}
        {/*</View>}*/}
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
    const microphonePermission = Platform.OS === "ios" ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;

    // Check if permission is available
    const result = await check(microphonePermission);
    if (result !== RESULTS.GRANTED) {
      // If permission is not available, request for it
      const requestResult = await request(microphonePermission);

      if (requestResult !== RESULTS.GRANTED) {
        return
      }
    }

    this.setState({ isRecording: true });
    try {
      await Voice.start("en-US");
    } catch (e) {
      console.error(e);
    }
  };
  onSpeechResults = async (e) => {

    const recognizedText = e.value[0];

    // Call the function passed down from the parent with the recognized text
    if (this.props.onSpeechResult) {
      this.props.onSpeechResult(recognizedText);
    }
  };
  stopRecording = async () => {
    try {
      await Voice.stop();
      this.setState({isRecording:false})

    } catch (e) {
      console.error(e);
    }
  };
}

const dynamicStyles = (isDark = false) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 20, // Add some padding if needed
      backgroundColor: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(236, 239, 241, 0.7)"
    },
    outerButtonContainer: {
      // backgroundColor: isDark ? "#000" : "#ECEFF1",
      paddingTop: 30,
      width: "100%"
    },
    mainContainer: {
      marginBottom: 50,
      alignItems: "center"
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

export default SpeechRecognizer;
