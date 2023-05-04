/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import LoginScreen from './src/screens/login';
import HomeScreen from './src/screens/home';
import { firebaseConfig } from './FirebaseConfig'; // Import the AuthLoading component
import OptionsScreen from './src/components/optionsScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Details from './src/screens/details';
import { View, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabMenu() {
  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }} >
      <Tab.Screen name="Entries" component={HomeWrapper} />
      <Tab.Screen name="Options" component={OptionsScreen} />
    </Tab.Navigator >
  );
}
function HomeWrapper() {
  return (<Stack.Navigator screenOptions={{ headerShown: false }}>

    <Tab.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Details" component={Details} />
  </Stack.Navigator >)
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
      console.log('----');
      console.log('auth state changed', user);
      this.setState({ loading: false, user });
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
        <NavigationContainer >
          {!this.state.user ? <LoginScreen /> : <TabMenu />}
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
