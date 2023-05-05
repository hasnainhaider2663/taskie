import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { TouchableOpacity } from 'react-native';

interface State {
  entries: any[],
  user?: any,

}

class NotesListComponent extends Component<any, State> {
  unsubscribeFirestore: any;
  userSub: any;
  constructor(props: any) {
    super(props);
    this.state = {
      entries: [],
    };
  }
  handleNavigateToDetails = (entryId: string) => {
    this.props.navigation.navigate('NoteDetails', { entryId });
  };
  componentDidMount() {
    this.userSub = auth().onAuthStateChanged(user => {
      this.setState({ user })
    });
    const user = auth().currentUser
    if (user) {
      this.unsubscribeFirestore = firestore()
        .collection('users')
        .doc(user.uid)
        .collection('entries')
        .onSnapshot(querySnapshot => {
          const entries = querySnapshot.docs.map(doc => doc.data());
          console.log('entries', entries)
          this.setState({ entries });
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

  renderItem = ({ item,index }) => {
    const itemNumber=index+1;
    const handlePlay = async () => {
      // Implement play functionality here
    };



    return (
      <TouchableOpacity style={styles.listItem} onPress={() => this.handleNavigateToDetails(item.id)}>
        <Text style={styles.index}>{itemNumber<10?'0'+itemNumber:''}/</Text>
        <Text style={styles.title}>{item.title}..</Text>

      </TouchableOpacity>
    );
  };
  render() {
    if (!this.state.user)
      return null
    return (
      <View style={styles.container}>
        {this.state.user ? <FlatList
          data={this.state.entries}
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
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    color:'#fff'
  },
  index:{
    color:'#fff',
    padding:10
  },
  title:{
    color:'#fff'
  }

});

export default NotesListComponent;
