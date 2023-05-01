import React, {Component} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface State {
  recordings: any[];
}

class RecordingsList extends Component<{}, State> {
  unsubscribeFirestore: any;

  constructor(props: {}) {
    super(props);
    this.state = {
      recordings: [],
    };
  }

  componentDidMount() {
    const user = auth().currentUser;
    if (user) {
      this.unsubscribeFirestore = firestore()
        .collection('users')
        .doc(user.uid)
        .collection('recordings')
        .onSnapshot(querySnapshot => {
          const recordings = querySnapshot.docs.map(doc => doc.data());
          this.setState({recordings});
        });
    }
  }

  componentWillUnmount() {
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
    }
  }

  renderItem = ({item}: {item: any}) => {
    return (
      <View style={styles.listItem}>
        <Text>{item.title}</Text>
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.recordings}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default RecordingsList;
