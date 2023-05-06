import React, { Component } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View,Animated } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import AudioRecorder from "../components/recorder";
import NotesListComponent from "../components/notes-list-component";
import Modal from "react-native-modal";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import Value = Animated.Value;

type User = FirebaseAuthTypes.UserInfo;

class NotesScreen extends Component<{ navigation: any }, {
  isModalVisible: boolean,
  user?: User,
  loading: boolean,selectedFilter?:string,viewHeight:Value,isCollapsed:boolean
}> {
  unsubscribeAuth;
  prevScrollY
  scrollY
  debounceTimeout: any;

  constructor(props) {
    super(props);
    this.state = {
      isModalVisible: false, loading: true,
      viewHeight: new Animated.Value(160), // Replace 100 with the initial height of your view
      isCollapsed: false,
    };
    this.scrollY = new Animated.Value(0);
    this.prevScrollY = new Animated.Value(0);

  }
  toggleCollapse = () => {
    const { isCollapsed, viewHeight } = this.state;
    const initialHeight = 160; // Replace 100 with the initial height of your view
    const collapsedHeight = 0;

    // Start the animation
    Animated.timing(viewHeight, {
      toValue: isCollapsed ? initialHeight : collapsedHeight,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Update the isCollapsed state
    this.setState({ isCollapsed: !isCollapsed });
  };
  handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const collapseTogglePoint=30
    console.log('currentScrollY',currentScrollY)
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      if (currentScrollY > collapseTogglePoint && !this.state.isCollapsed) {
        this.toggleCollapse();
      } else if (currentScrollY < collapseTogglePoint&& this.state.isCollapsed) {
        this.toggleCollapse();
      }
      this.prevScrollY = currentScrollY;
    }, 5); // 200 ms debounce time, adjust as needed
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
  }

  componentWillUnmount() {
    this.unsubscribeAuth();
  }

  render() {
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
            <Icon name="add" size={40} color="#F5F5F5" />
          </TouchableOpacity>
        </View>

        {/*{ height: this.state.viewHeight }*/}
        <Animated.View style={[styles.mainSectionWrapper,{ height: this.state.viewHeight }]}>
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
          <TouchableOpacity style={[styles.filterButton,styles.filterSelected]}>
            <Text style={styles.filterButtonText}>#personal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={[styles.filterButtonText]}>#work</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>#home</Text>
          </TouchableOpacity>
          </ScrollView>
        </View>

          <NotesListComponent {...this.props}       onScroll={this.handleScroll}
          />
        <Modal
          isVisible={this.state.isModalVisible}
          onBackdropPress={this.toggleModal}
          onSwipeComplete={this.toggleModal}
          swipeDirection="down"
          propagateSwipe
          style={styles.modal}>
          <View style={styles.modalContent}>
            <AudioRecorder />
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#131313",
    paddingTop: 60,
    paddingHorizontal:20
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    paddingVertical: 20
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
    color: "#999"
  },
  username: {
    color: "#F5F5F5"
  },
  recordButton: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  yourTitle: {
    color: "#F5F5F5",
    maxWidth: 400,
    fontSize: 70,
    fontWeight: "400",
    paddingLeft: 20
  },
  notesTitle: {
    color: "#F5F5F5",
    maxWidth: 400,
    fontSize: 70,
    fontWeight: "400",
    paddingLeft: 40
  },
  notesCount: {
    color: "#bbb",
    fontSize: 46.6,
    fontWeight: "500",

    marginBottom: 10
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    borderColor:'#f5f5f5',
    paddingVertical:30
  },
  filterButton: {
    borderWidth: 1,
    borderColor: "#F5F5F5",
    borderRadius: 100,
    padding: 15,
    paddingHorizontal: 15,
    marginLeft: 10
  },
  filterSelected:{
    borderColor: "#FE6902",
    backgroundColor:'#FE6902'
  },
  filterButtonText: {
    color: "#F5F5F5",
    fontSize: 20
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0
  },
  modalContent: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 20,
    height: "50%"
  },
  mainSectionWrapper: {
    width:'100%',
    justifyContent:'space-between',
    flexDirection:'row',
    alignItems:'flex-end'
  },
  yourNotesWrapper: {  },
  bottomSection: {
    borderTopWidth: 1,
    borderColor: '#ccc',
  }
});

export default NotesScreen;


