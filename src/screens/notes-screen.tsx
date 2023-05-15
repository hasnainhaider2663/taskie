import React, { Component } from "react";
import {
  Animated,
  Appearance,
  ColorSchemeName,
  Image,
  NativeEventSubscription,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import AudioRecorder from "../components/recorder";
import NotesListComponent from "../components/notes-list-component";
import Modal from "react-native-modal";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import Value = Animated.Value;

type User = FirebaseAuthTypes.UserInfo;

interface State {
  isModalVisible: boolean;
  user?: User;
  loading: boolean;
  selectedFilter?: string;
  viewHeight: Value;
  isCollapsed: boolean;
  colorScheme: ColorSchemeName;
}

interface Props {
  navigation: any;
}

class NotesScreen extends Component<Props, State> {
  colorSchemeSubscription!: NativeEventSubscription;
  unsubscribeAuth!: () => void;
  prevScrollY;
  scrollY;
  debounceTimeout: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      isModalVisible: false, loading: true,
      viewHeight: new Animated.Value(160), // Replace 100 with the initial height of your view
      isCollapsed: false,
      colorScheme: Appearance.getColorScheme()
    };
    this.scrollY = new Animated.Value(0);
    this.prevScrollY = new Animated.Value(0);

  }

  toggleCollapse = () => {
    const { isCollapsed, viewHeight } = this.state;
    const initialHeight = 160;
    const collapsedHeight = 0;

    Animated.timing(viewHeight, {
      toValue: isCollapsed ? initialHeight : collapsedHeight,
      duration: 300,
      useNativeDriver: false
    }).start();

    this.setState({ isCollapsed: !isCollapsed });
  };
  handleScroll = (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const collapseTogglePoint = 30;
    console.log("currentScrollY", currentScrollY);
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      if (currentScrollY > collapseTogglePoint && !this.state.isCollapsed) {
        this.toggleCollapse();
      } else if (currentScrollY < collapseTogglePoint && this.state.isCollapsed) {
        this.toggleCollapse();
      }
      this.prevScrollY = currentScrollY;
    }, 5);
  };

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  componentDidMount(): void {
    this.unsubscribeAuth = auth().onAuthStateChanged((user: any) => {
      console.log("----");
      console.log("auth state changed", user);
      if (user) {
        this.setState({ loading: false, user: (user as User) });
      }
    });
    this.colorSchemeSubscription = Appearance.addChangeListener(({ colorScheme }) => {
      this.setState({ colorScheme });
    });
  }

  componentWillUnmount() {
    this.unsubscribeAuth();
    this.colorSchemeSubscription.remove();

  }

  render() {
    const { colorScheme } = this.state;
    const styles = dynamicStyles(colorScheme);
    return (

      <View style={styles.container}>
        <View style={styles.header}>

          <View style={styles.headerInner}>
            <Image
              source={{ uri: this.state.user?.photoURL }}
              style={styles.profilePicture}
            />
            <Text style={styles.mutedText}>Welcome,</Text>
            <Text style={styles.username}>{" " + this.state.user?.displayName?.split(" ")[0]}</Text>
          </View>

          <TouchableOpacity style={styles.recordButton} onPress={this.toggleModal}>
            <Icon name="add" size={40} style={styles.recordButtonIcon} />
          </TouchableOpacity>
        </View>

        {/*{ height: this.state.viewHeight }*/}
        <Animated.View style={[styles.mainSectionWrapper, { height: this.state.viewHeight }]}>
          <View style={styles.yourNotesWrapper}>

            <Text style={styles.yourTitle}>your</Text>
            <Text style={styles.notesTitle}>notes</Text>
          </View>

          <Text style={styles.notesCount}>/14</Text>
        </Animated.View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>#side hustle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterButton, styles.filterSelected]}>
              <Text style={[styles.filterButtonText, styles.selectedFilterButtonText]}>#personal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={[styles.filterButtonText]}>#work</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>#home</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <NotesListComponent {...this.props} onScroll={this.handleScroll}
        />
        <Modal
          isVisible={this.state.isModalVisible}
          onBackdropPress={this.toggleModal}
          onSwipeComplete={this.toggleModal}
          swipeDirection="down"
          propagateSwipe
          style={styles.modal}>
          <View style={styles.modalContent}>
            <AudioRecorder user={this.state.user} isDark={this.state.colorScheme==='dark'} />
          </View>
        </Modal>
      </View>
    );
  }
}


const dynamicStyles = (colorScheme: ColorSchemeName) => {
  const isDark = colorScheme === "dark";

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      backgroundColor: isDark ? "#131313" : "transparent",
      paddingTop: 60,
      paddingHorizontal: 20
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#F5F5F5" : "#333333",
      paddingBottom: 20
    },
    headerInner: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center"
    },
    profilePicture: {
      width: 40,
      height: 40,
      borderRadius: 25,
      marginHorizontal: 10
    },
    mutedText: {
      color: isDark ? "#999" : "#666666"
    },
    username: {
      color: isDark ? "#F5F5F5" : "#333333"
    },
    recordButton: {
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10
    }, recordButtonIcon: {
      color: isDark ? "#F5F5F5" : "#333333"
    },
    yourTitle: {
      color: isDark ? "#F5F5F5" : "#333333",
      maxWidth: 400,
      fontSize: 70,
      fontWeight: "400",
      paddingLeft: 20
    },
    notesTitle: {
      color: isDark ? "#F5F5F5" : "#333333",
      maxWidth: 400,
      fontSize: 70,
      fontWeight: "400",
      paddingLeft: 40
    },
    notesCount: {
      color: isDark ? "#bbb" : "#555555",
      fontSize: 46.6,
      fontWeight: "500",
      marginBottom: 10
    },
    filterContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: "100%",
      borderColor: isDark ? "#f5f5f5" : "#333333",
      paddingVertical: 30,
      borderBottomWidth: 1
    },
    filterButton: {
      borderWidth: 1,
      borderColor: isDark ? "#F5F5F5" : "#333333",
      borderRadius: 100,
      padding: 15,
      paddingHorizontal: 15,
      marginLeft: 10
    },
    filterSelected: {
      borderColor: "#FE6902",
      backgroundColor: "#FE6902",
      color: isDark ? "#fff" : "#333333"

    },

    filterButtonText: {
      color: isDark ? "#F5F5F5" : "#333333",
      fontSize: 20
    },
    selectedFilterButtonText: {

      color: isDark ? "#131313" : "#f5f5f5"

    },
    modal: {
      justifyContent: "flex-end",
      margin: 0
    },
    modalContent: {
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      height: "30%"
    },
    mainSectionWrapper: {
      width: "100%",
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "flex-end"
    },
    yourNotesWrapper: {},
    bottomSection: {
      borderTopWidth: 1,
      borderColor: isDark ? "#ccc" : "#555555"
    }

  });
};

export default NotesScreen;
