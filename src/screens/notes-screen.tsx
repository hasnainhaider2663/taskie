import React, { Component } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import AudioRecorder from "../components/recorder";
import NotesListComponent from "../components/notes-list-component";
import Modal from "react-native-modal";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

type User = FirebaseAuthTypes.UserInfo;

class NotesScreen extends Component<{ navigation: any }, {
  isModalVisible: boolean,
  user?: User,
  loading: boolean
}> {
  unsubscribeAuth;

  constructor(props) {
    super(props);
    this.state = {
      isModalVisible: false, loading: true
    };
  }

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
            <Icon name="add" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.mainSectionWrapper}>
          <View style={styles.yourNotesWrapper}>

        <Text style={styles.yourTitle}>your</Text>
        <Text style={styles.notesTitle}>notes</Text>
          </View>

          <Text style={styles.notesCount}>/14</Text>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>#personal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>#work</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>#home</Text>
          </TouchableOpacity>
        </View>
        <NotesListComponent {...this.props} />
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
    backgroundColor: "#000",
    paddingTop: 60,
    paddingHorizontal:20
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#FFF",
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
    color: "#FFF"
  },
  recordButton: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  yourTitle: {
    color: "#FFF",
    maxWidth: 400,
    fontSize: 70,
    fontWeight: "bold",
    paddingLeft: 20
  },
  notesTitle: {
    color: "#FFF",
    maxWidth: 400,
    fontSize: 70,
    fontWeight: "bold",
    paddingLeft: 40
  },
  notesCount: {
    color: "#ccc",
    fontSize: 46.6,
    marginBottom: 10
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%"
  },
  filterButton: {
    borderWidth: 1,
    borderColor: "#FFF",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginVertical: 10
  },
  filterButtonText: {
    color: "#FFF",
    fontSize: 16
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
  yourNotesWrapper: {  }
});

export default NotesScreen;


