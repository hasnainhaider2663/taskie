import React, { Component } from "react";
import {
  Alert,
  Appearance,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { Block, BlockType, ChechListItem, CheckListBlock, ImageBlock, TextBlock } from "../models/blocks";
import BackButton from "../components/back-button";
import EditTextControls from "../components/edit-text-controls";

type Props = {
  route: {
    params: {
      entryId: string;
    };
  }, navigation?: any;

};

type State = {
  entry: any;
  isLoading: boolean;
  user?: any;
  isDark?: boolean;
};

class NoteDetailsScreen extends Component<Props, State> {
  unsubscribeAuth;
  colorSchemeSubscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      entry: null,
      isLoading: true,
      isDark: Appearance.getColorScheme() === "dark" // Set this to true for dark mode
    };
  }


  render() {
    const { isLoading, entry, isDark } = this.state;
    const styles = dynamicStyles(isDark);
    if (isLoading) {
      return (
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      );
    }

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <BackButton isDark={!!this.state.isDark} />
            <TouchableOpacity onPress={() => this.showDeleteConfirmation()}>
              <Text style={[styles.textRight, { color: "#131313" }]}>delete</Text>
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
          {entry.blocks?.map((block: Block, index: number) => (
            <React.Fragment key={index}>
              {this.renderBlock(block)}
            </React.Fragment>
          ))}
          <EditTextControls />
        </View>
      </TouchableWithoutFeedback>
    );
  }

  componentDidMount(): void {

    this.unsubscribeAuth = auth().onAuthStateChanged(async user => {
      this.setState({ user });
      await this.fetchEntry();
    });
    this.colorSchemeSubscription = Appearance.addChangeListener(({ colorScheme }) => {
      this.setState({ isDark: colorScheme === "dark" });
    });
  }

  componentWillUnmount() {
    this.unsubscribeAuth();
    this.colorSchemeSubscription.remove();

  }

  async fetchEntry() {
    const { entryId } = this.props.route.params;

    try {
      const entryRef = firestore().collection("users").doc(this.state.user.uid).collection("entries").doc(entryId);
      entryRef.onSnapshot(entryDoc => {
        if (entryDoc.exists) {
          this.setState({
            entry: entryDoc.data(),
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
    const { entryId } = this.props.route.params;

    try {
      await firestore()
        .collection("users")
        .doc(this.state.user.uid)
        .collection("entries")
        .doc(entryId)
        .delete();

      // Go back to the previous screen after deleting the entry
      this.props.navigation.goBack();
    } catch (error) {
      console.error("Error deleting entry: ", error);
    }
  }

  handleInputChange(blockItem: Block, text: string) {
    // Update the text of the TextBlock
    // (blockItem.block as TextBlock).text = text;
    let entry = this.state.entry;
    entry.blocks[0].block = { text };

    this.setState({ entry });
    console.log(this.state.entry.blocks[0]);

  }

  async saveChanges(blockItem: Block) {
    console.log("save the changes!!!");
  }

  renderBlock(blockItem: Block) {
    const { isDark } = this.state;
    const styles = dynamicStyles(isDark);
    switch (blockItem.type) {
      case BlockType.TextBlock:
        return (
          <View style={styles.blockContainer}>
            <TextInput
              style={styles.text}
              value={(blockItem.block as TextBlock).text}
              multiline={true}
              keyboardAppearance="default"
              inputMode="text"
              onChangeText={text => this.handleInputChange(blockItem, text)}
              onBlur={() => this.saveChanges(blockItem)}
              returnKeyType={"done"}
            />

          </View>
        );
      case BlockType.AudioBlock:
        return (
          <View style={styles.blockContainer}>
            {/* Render your audio player component with the audio source */}
            {/* Example: <AudioPlayer source={(block as AudioBlock).audio} /> */}
          </View>
        );
      case BlockType.ImageBlock:
        return (
          <View style={styles.blockContainer}>
            <Image style={styles.image} source={{ uri: (blockItem.block as ImageBlock).imgUrl }} />
          </View>
        );
      case BlockType.VideoBlock:
        return (
          <View style={styles.blockContainer}>
            {/* Render your video player component with the video source */}
            {/* Example: <VideoPlayer source={(block as VideoBlock).videoUrl} /> */}
          </View>
        );
      case BlockType.CheckListBlock:
        return (
          <View style={styles.blockContainer}>
            {(blockItem.block as CheckListBlock).items.map((item: ChechListItem, index: number) => (
              <TouchableOpacity key={index} onPress={() => {
              }}>
                <Text style={styles.text}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

}


const dynamicStyles = (isDark = false) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 70,
      paddingHorizontal: 20,
      backgroundColor: isDark ? "#131313" : "#F5F5F5"
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
    }
  });
};

export default NoteDetailsScreen;
