/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import LoginScreen from './src/screens/login';
import HomeScreen from './src/screens/home';
import {firebaseConfig} from './FirebaseConfig'; // Import the AuthLoading component
import {createDrawerNavigator} from '@react-navigation/drawer';
import OptionsScreen from './src/components/optionsScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();


function TabMenu() {
  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Options" component={OptionsScreen} />
      {/* Add other screens to the menu here */}
    </Tab.Navigator>
  );
}

class App extends React.Component<
  any,
  {
    initialRoute?: string;
    loading: boolean;
    user: any;
  }
> {
  unsubscribeAuth!: () => void;

  constructor(props: any) {
    super(props);

    this.state = {
      initialRoute: undefined,
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
    // Check if user is logged in
    this.unsubscribeAuth = auth().onAuthStateChanged(user => {
      console.log('----');
      console.log('auth state changed',user);

      if (user) {
        this.setState({initialRoute: 'Home', loading: false, user});

        // this.props.navigation.navigate('Home')
      } else {
        this.setState({initialRoute: 'Login', loading: false, user});
        // this.props.navigation.navigate('Login')
      }
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
      <NavigationContainer>
        {!this.state.user ? <LoginScreen /> : <TabMenu />}
      </NavigationContainer>
    );
  }
}

export default App;
