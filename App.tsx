import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/login';


type RootStackParamList = {
  Login: undefined;
  // Add other screens here
};

const Stack = createStackNavigator<RootStackParamList>();
const firebaseConfig = {
  apiKey: "AIzaSyBX9m6I7IXCci3CMHdb3WAFnDRvK10a0lI",
  authDomain: "taskie-38162.firebaseapp.com",
  projectId: "taskie-38162",
  storageBucket: "taskie-38162.appspot.com",
  messagingSenderId: "568178372932",
  appId: "1:568178372932:web:9e1fa63ce61e154c5b2711",
  measurementId: "G-H7YDQWSVJR"
};
const App = () => {
  // Initialize Firebase
  // if (!firebase.apps.length) {
  //   firebase.initializeApp(firebaseConfig);
  // }
  

  // Configure Google Sign-In
  // GoogleSignin.configure({
  //   webClientId: '568178372932-3ndig3kbh0ukjnn2ssmes9n66g224url.apps.googleusercontent.com',
  // });

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* Add other screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
