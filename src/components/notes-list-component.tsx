import React, { Component } from "react";
import {
  Animated,
  Appearance,
  ColorSchemeName,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Entry } from "../models/recording";
import Icon from "react-native-vector-icons/Ionicons";
import padWithZeroes from "../helpers/padWithZeroes";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
interface State {
  entries: Entry[],
  user?: any,
  colorScheme:ColorSchemeName

}

class NotesListComponent extends Component<any, State> {
  unsubscribeFirestore: any;
  userSub: any;
  colorSchemeSubscription
  constructor(props: any) {
    super(props);
    this.state = {
      entries: [],
      colorScheme: Appearance.getColorScheme(),

    };
  }

  handleNavigateToDetails = (entryId: string) => {
    this.props.navigation.navigate("NoteDetails", { entryId });
  };

  componentDidMount() {
    this.colorSchemeSubscription = Appearance.addChangeListener(({ colorScheme }) => {
      this.setState({ colorScheme });
    });
    this.userSub = auth().onAuthStateChanged(user => {
      this.setState({ user });
    });
    const user = auth().currentUser;
    if (user) {
      this.unsubscribeFirestore = firestore()
        .collection("users")
        .doc(user.uid)
        .collection("entries")
        .onSnapshot(querySnapshot => {
          const entries = querySnapshot.docs.map(doc => doc.data() as Entry);
          console.log("entries", entries);

          this.setState({ entries });
        });
    }
  }

  componentWillUnmount() {
    this.colorSchemeSubscription.remove();
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
    }
    if (this.userSub) {
      this.userSub();
    }
  }

  renderItem = ({ item, index }) => {

    const styles = dynamicStyles(this.state.colorScheme);
    const itemNumber = index + 1;


    return (
      <TouchableOpacity
        style={[
          styles.listItem,
          index === this.state.entries.length - 1
            ? { borderBottomWidth: 0 }
            : null,
          index === 0 ? { borderTopWidth: 0 } : null,
        ]}
        onPress={() => this.handleNavigateToDetails(item.id)}
      >
        <Text style={styles.index}>
          {padWithZeroes(itemNumber, this.state.entries.length.toString().length)}/
        </Text>
        <View style={styles.contentWrapper}>
          <View style={styles.textAreaWrapper}>
            <Text style={styles.title}>{item.title}...</Text>
            <Text style={styles.excerpt}>{item.blocks[0].block?.text}..</Text>
          </View>
          <Icon
            style={styles.linkArrow}
            name="arrow-forward"
            size={24}
          />
        </View>
      </TouchableOpacity>
    );

  };

  render() {
    const styles = dynamicStyles(this.state.colorScheme);

    if (!this.state.user)
      return null;
    return (
      <View style={styles.container}>
        {this.state.user ? <AnimatedFlatList showsVerticalScrollIndicator={false}
                                             data={this.state.entries} onScroll={this.props.onScroll}
                                             renderItem={this.renderItem}
                                             keyExtractor={(item, index) => index.toString()}
        /> : null}
      </View>
    );
  }
}
const dynamicStyles = (colorScheme:ColorSchemeName) => {
  const isDark = colorScheme === "dark";
  return StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
    },
    listItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingTop: 10,
      paddingBottom: 30,
      color: isDark ? "#F5F5F5" : "#131313",
      borderBottomWidth: 0,
      borderTopWidth: 1,
      borderColor: isDark ? "#F5F5F5" : "#131313",
    },
    contentWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 1,
    },
    index: {
      color: isDark ? "#aaa" : "#555",
      fontWeight: "bold",
      textAlign: 'left',
    },
    title: {
      color: isDark ? "#fff" : "#333",
      fontSize: 30,
      maxWidth: "100%",
    },
    excerpt: {
      color: isDark ? "#a9a9a9" : "#767676",
      fontSize: 15,
      paddingVertical: 10,
      maxWidth: "100%",
    },
    textAreaWrapper: {
      maxWidth: "90%",
      minWidth: '90%',
      paddingLeft: 10,
    },
    linkArrow: {
      transform: [{ rotate: "-45deg" }],
      position: "absolute",
      color: isDark ? "#F5F5F5" : "#131313",
      right: 0,
      top: 0,
    },
  });
};

export default NotesListComponent;
