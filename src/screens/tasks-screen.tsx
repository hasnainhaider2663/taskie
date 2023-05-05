import React, { Component } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import AudioRecorder from '../components/recorder';
import NotesListComponent from '../components/notes-list-component';
import Modal from 'react-native-modal';

class TasksListScreen extends Component<{ navigation: any }> {
  state = {
    isModalVisible: false,
  };

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  render() {
    return (
      <View style={styles.container}>
        <NotesListComponent {...this.props} />
        <TouchableOpacity
          style={styles.recordButton}
          onPress={this.toggleModal}>
          <Icon name="add" size={40} color="#FFFFFF" />
        </TouchableOpacity>

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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  recordButton: {
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 20,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 20,
    height: '90%',
  },
});

export default TasksListScreen;
