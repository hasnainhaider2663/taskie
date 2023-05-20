import React, { Component } from "react";
import {
  Alert,
  Appearance,
  Keyboard,
  KeyboardAvoidingView,
  NativeEventSubscription,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import BackButton from "../components/back-button";
import { Entry } from "../models/entry";
import Whisper from "../components/whisper";

type Props = {
  route: {
    params: {
      entryId: string;
    };
  }, navigation?: any;

};

type State = {
  entry?: Entry;
  isLoading: boolean;
  user?: any;
  isDark?: boolean;
  entryRef?: FirebaseFirestoreTypes.DocumentReference
};

class NoteDetailsScreen extends Component<Props, State> {
  unsubscribeAuth?: () => void;
  colorSchemeSubscription?: NativeEventSubscription;
  debounce;

  constructor(props: Props) {
    super(props);

    this.state = {
      entry: undefined,
      isLoading: true,
      isDark: Appearance.getColorScheme() === "dark" // Set this to true for dark mode
    };
  }


  render() {
    const { isLoading, entry, isDark, entryRef } = this.state;
    const styles = dynamicStyles(isDark);
    if (isLoading || !entry || !entryRef) {
      return (
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      );
    }


    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

          <View style={styles.Wrapper}>
            <View style={styles.container}>
              <View style={styles.headerContainer}>
                <BackButton isDark={!!this.state.isDark} />
                <TouchableOpacity onPress={() => this.showDeleteConfirmation()}>
                  <Text style={[styles.textRight, styles.deleteBtn]}>delete</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.border} />
              <View style={styles.textContainer}>
                <Text style={styles.textLeft}>18/11/22</Text>
                <TouchableOpacity>
                  <Text style={styles.textRight}>#work</Text>
                </TouchableOpacity>

              </View>
              <Text style={styles.title}>{entry.title}</Text>

              <View style={styles.blockContainer}>
                <TextInput
                  style={styles.text}
                  value={entry.text}
                  multiline={true}
                  keyboardAppearance="default"
                  inputMode="text"
                  // onChangeText={text => this.handleInputChange(text)}
                  onBlur={() => this.saveChanges(entry)}
                  returnKeyType={"done"} onSelectionChange={this.handleSelectionChange}
                  showSoftInputOnFocus={false}
                />

              </View>

              {/*<EditTextControls />*/}
            </View>
            <View style={styles.audioRecorderContainer}>
              <Whisper user={this.state.user} embedded={true}
                                isDark={this.state.isDark}
                                onSpeechResult={text => this.handleSpeechResult(text)}
              />
              {/*<AudioRecorder user={this.state.user} firebasePath={this.state.entryRef?.id} embedded={true} isDark={this.state.isDark}/>*/}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  handleSpeechResult = (text: string) => {
    console.log('whispered!!!',text)
    let newText = "";

    if (!this.state.entry)
      return;
    if (this.state.entry.selection) {
      // Get the selection start and end
      const selectionStart = this.state.entry.selection.start;
      const selectionEnd = this.state.entry.selection.end;

      // Cut the original text into two parts: before the selection and after the selection
      const textBeforeSelection = this.state.entry.text.slice(0, selectionStart);
      const textAfterSelection = this.state.entry.text.slice(selectionEnd);

      // Insert the new text in between these two parts
      newText = textBeforeSelection + text + textAfterSelection;
    } else {
      // If the selection is not defined, append the new text to the end of the existing text
      newText = this.state.entry.text + "\n" + text;
    }

    this.handleInputChange(newText);
  };

  handleInputChange(text: string) {
    this.setState(prevState => {
      if (!prevState.entry)
        return;

      let entry = {...prevState.entry};
      entry.text = text;

      if (this.debounce) {
        clearTimeout(this.debounce);
      }

      this.debounce = setTimeout(async () => {
        console.clear()
        console.log("---------TEXT",text);
        await this.state.entryRef?.update(entry);
      }, 1000);

      return { entry };
    });
  }


  handleSelectionChange = ({ nativeEvent: { selection } }) => {
    const { entry } = this.state;
    if (!entry) return;
    entry.selection = selection;
    this.setState({ entry });
    // this.state.entryRef?.update(entry)
  };

  componentDidMount(): void {

    this.unsubscribeAuth = auth().onAuthStateChanged(async user => {
      if (!user)
        return;
      const { entryId } = this.props.route.params;
      const entryRef = firestore().collection("users").doc(user.uid).collection("entries").doc(entryId);

      this.setState({ user, entryRef });
      await this.fetchEntry();
    });
    this.colorSchemeSubscription = Appearance.addChangeListener(({ colorScheme }) => {
      this.setState({ isDark: colorScheme === "dark" });
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
    if (this.colorSchemeSubscription) {
      this.colorSchemeSubscription.remove();
    }
  }

  async fetchEntry() {

    try {
      this.state.entryRef?.onSnapshot(entryDoc => {
        if (entryDoc.exists) {
          this.setState({
            entry: entryDoc.data() as Entry,
            isLoading: false
          });
        } else {
          this.setState({ isLoading: false });
        }
      });


    } catch (error) {
      console.error(error);
      this.setState({ isLoading: false });
    }
  }

  showDeleteConfirmation() {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => this.deleteEntry() }
      ],
      { cancelable: false }
    );
  }

  async deleteEntry() {

    try {
      await this.state.entryRef?.delete();

      // Go back to the previous screen after deleting the entry
      this.props.navigation.goBack();
    } catch (error) {
      console.error("Error deleting entry: ", error);
    }
  }


  async saveChanges(entry: Entry) {
    console.log("save the changes!!!");
  }
}


const dynamicStyles = (isDark = false) => {
  return StyleSheet.create({

    Wrapper: {
      flex: 1,
      paddingTop: 70,
      backgroundColor: isDark ? "#131313" : "#F5F5F5"
    },
    container: {
      flex: 1,
      paddingHorizontal: 20
    },
    audioRecorderContainer: {
      position: "absolute",
      bottom: 0,
      width: "100%"
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    border: {
      borderBottomWidth: 1,
      borderColor: isDark ? "#F5F5F5" : "#131313",
      marginVertical: 10
    },
    textContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    textLeft: {
      textAlign: "left",
      color: isDark ? "#909090" : "#666666"
    },
    textRight: {
      textAlign: "right",
      color: isDark ? "#909090" : "#666666"
    },
    blockContainer: {},
    image: {},
    title: {
      paddingVertical: 30,
      fontSize: 60,
      fontWeight: "500",
      color: isDark ? "#F5F5F5" : "#131313"
    },
    text: {
      fontSize: 20,
      width: "100%",
      color: isDark ? "#F5F5F5" : "#494949"
    },
    deleteBtn: {
      color: isDark ? "#F5F5F5" : "#131313"
    }
  });
};

export default NoteDetailsScreen;
