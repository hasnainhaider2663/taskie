import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { View, Text,SafeAreaView } from 'react-native';
import LoginScreen from './src/screens/login';
import HomeScreen from './src/screens/home';
import AuthLoading from './src/screens/authloading'; // Import the AuthLoading component


const Stack = createStackNavigator();
const firebaseConfig = {
  apiKey: "AIzaSyBX9m6I7IXCci3CMHdb3WAFnDRvK10a0lI",
  authDomain: "taskie-38162.firebaseapp.com",
  projectId: "taskie-38162",
  storageBucket: "taskie-38162.appspot.com",
  messagingSenderId: "568178372932",
  appId: "1:568178372932:web:9e1fa63ce61e154c5b2711",
  measurementId: "G-H7YDQWSVJR"
};
class App extends React.Component<any,{
  initialRoute?: string,
  loading: boolean,
  user:any
}> {
  unsubscribeAuth;
  constructor(props:any) {
    super(props);

    this.state = {
      initialRoute: undefined,
      loading: true,
      user:null
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '568178372932-3ndig3kbh0ukjnn2ssmes9n66g224url.apps.googleusercontent.com',
    });
   
  }

  componentDidMount(): void {
    // Check if user is logged in
    this.unsubscribeAuth = auth().onAuthStateChanged((user) => {
    
      console.log('----')
      console.log('auth state changed')
      
      if (!!user) {
        this.setState({ initialRoute: 'Home', loading: false,user });
        
        // this.props.navigation.navigate('Home')
      } else {
        this.setState({ initialRoute: 'Login', loading: false,user });
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

      
      return (<SafeAreaView style={{ flex: 1 }}>

        <View style={{ flex: 1 }}>
        <Text style={{ textAlign: 'center', fontSize: 24,color:"#000" }}>Welcome to MyApp</Text>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="AuthLoading">
          <Stack.Screen name="AuthLoading" component={AuthLoading} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          {/* Add other screens here */}
        </Stack.Navigator>
      </NavigationContainer>
      </View>
    </SafeAreaView>
);
    
  }
}

export default App;
