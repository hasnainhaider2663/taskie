/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import LoginScreen from './src/screens/login';
import NotesScreen from './src/screens/notes-screen';
import {firebaseConfig} from './FirebaseConfig'; // Import the AuthLoading component
import OptionsScreen from './src/components/optionsScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import NoteDetailsScreen from './src/screens/note-details-screen';
import {View, StyleSheet} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabMenu() {
  return (

  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: 'white',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { backgroundColor: '#131313' },
    }}
  >
    {/*<Tab.Screen name="Dashboard" component={DashboardScreen} />*/}
    {/*<Tab.Screen name="Tasks" component={TasksListScreen} />*/}
    <Tab.Screen
      name="Notes"
      component={NotesWrapper}
      options={{
        tabBarLabel: 'Notes',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="ios-book" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Options"
      component={OptionsScreen}
      options={{
        tabBarLabel: 'Options',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="ios-settings" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
  );
}

function NotesWrapper() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="NotesScreen" component={NotesScreen} />
      <Stack.Screen name="NoteDetails" component={NoteDetailsScreen} />
    </Stack.Navigator>
  );
}

class App extends React.Component<
  any,
  {
    loading: boolean;
    user: any;
  }
> {
  unsubscribeAuth!: () => void;

  constructor(props: any) {
    super(props);

    this.state = {
      loading: true,
      user: null,
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId:
        '568178372932-3ndig3kbh0ukjnn2ssmes9n66g224url.apps.googleusercontent.com',
    });
  }

  componentDidMount(): void {
    this.unsubscribeAuth = auth().onAuthStateChanged(user => {
      this.setState({loading: false, user});
    });
  }

  componentWillUnmount() {
    this.unsubscribeAuth();
  }

  render() {
    if (this.state.loading) {
      return null; // Show a loading spinner or a placeholder while checking for user authentication
    }
    return (
      <View style={styles.container}>
        <NavigationContainer>
          {!this.state.user ? <LoginScreen /> : <NotesWrapper />}
        </NavigationContainer>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
