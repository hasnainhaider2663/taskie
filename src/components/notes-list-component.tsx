import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { TouchableOpacity,Animated } from 'react-native';
import { Entry } from "../models/recording";
import Icon from "react-native-vector-icons/Ionicons";
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface State {
  entries: Entry[],
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
          const entries = querySnapshot.docs.map(doc => doc.data() as Entry);
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
      <TouchableOpacity style={[styles.listItem, index===this.state.entries.length-1? {borderBottomWidth:0}:null]} onPress={() => this.handleNavigateToDetails(item.id)}>
        <Text style={styles.index}>{itemNumber<10?'0'+itemNumber:''}/</Text>
        <View style={styles.textAreaWrapper}>
          <Text style={styles.title}>{item.title}..</Text>
          <Text style={styles.excerpt}>{item.blocks[0].block?.text}..</Text>

        </View>
        <Icon style={styles.linkArrow} name="arrow-forward" size={24} color="#FFFFFF" />

      </TouchableOpacity>
    );
  };
  render() {
    if (!this.state.user)
      return null
    return (
      <View style={styles.container}>
        {this.state.user ? <AnimatedFlatList showsVerticalScrollIndicator={false}
          data={this.state.entries} onScroll={this.props.onScroll}  renderItem={this.renderItem}
          keyExtractor={(item, index) => index.toString()}
        /> : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 30,
    color:'#F5F5F5',
    borderBottomWidth:0,
    borderTopWidth:1,
    borderColor:'#f5f5f5'
  },
  index:{
    color:'#aaa',
    fontWeight:'bold',
    paddingRight:10
  },
  title:{
    color:'#fff',
    fontSize:30
  },
  excerpt:{
    color:'#a9a9a9',
    fontSize:15,
    paddingVertical:10
  },
  textAreaWrapper: {
    width:'80%'
  },
  linkArrow: {
    transform: [{ rotate: '-45deg' }],
  }

});

export default NotesListComponent;
