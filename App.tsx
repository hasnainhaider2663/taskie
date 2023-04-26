import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from 'react-native-google-signin';
import LoginScreen from './src/screens/login';


type RootStackParamList = {
  Login: undefined;
  // Add other screens here
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  // Initialize Firebase
  if (!auth().app.options.appId) {
    auth().app.initializeApp();
  }

  // Configure Google Sign-In
  GoogleSignin.configure({
    webClientId: '568178372932-3ndig3kbh0ukjnn2ssmes9n66g224url.apps.googleusercontent.com',
  });

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
