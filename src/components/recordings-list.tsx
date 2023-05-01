import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { TouchableOpacity } from 'react-native';

interface State {
  recordings: any[],
  user?: any,
}

class RecordingsList extends Component<{}, State> {
  unsubscribeFirestore: any;
  userSub: any;
  constructor(props: {}) {
    super(props);
    this.state = {
      recordings: [],
    };
  }

  componentDidMount() {
    this.userSub = auth().onAuthStateChanged(user => {
      this.setState({ user })
    });
    const user = auth().currentUser
    if (user) {
      this.unsubscribeFirestore = firestore()
        .collection('users')
        .doc(user.uid)
        .collection('recordings')
        .onSnapshot(querySnapshot => {
          const recordings = querySnapshot.docs.map(doc => doc.data());
          console.log('recordings', recordings)
          this.setState({ recordings });
        });
    }
  }

  componentWillUnmount() {
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
    }
    if (this.userSub) {
      this.userSub();
    }
  }

  renderItem = ({ item }) => {
    const handlePlay = async () => {
      // Implement play functionality here
    };

    const handleEdit = async () => {
      // Implement edit functionality here
    };

    const handleDelete = async () => {
      // Implement delete functionality here
      await firestore().collection('users').doc(this.state.user.uid).collection('recordings').doc(item.id).delete()

    };

    return (
      <View style={styles.listItem}>
        <Text>{item.title}..</Text>
        <View style={styles.buttonContainer}>

          <TouchableOpacity onPress={handleEdit} style={styles.button}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.button}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  render() {
    if (!this.state.user)
      return null
    return (
      <View style={styles.container}>
        {this.state.user ? <FlatList
          data={this.state.recordings}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index.toString()}
        /> : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    width: '100%'
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 4,
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
  },

});

export default RecordingsList;
