import React from 'react';
import {View, Button} from 'react-native';
import auth from '@react-native-firebase/auth';

class OptionsScreen extends React.Component<{navigation: any}> {
  render() {
    const handleLogout = async () => {
      // Perform your logout logic here
      await auth().signOut();
      // navigation.navigate('Login');
    };

    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    );
  }
}

export default OptionsScreen;
