import { Button, StyleSheet, Text, View } from 'react-native';

import { useAuthSession } from '@/providers/AuthProvider';
import { useState } from 'react';

export default function HomeScreen() {
  const {signOut, token} = useAuthSession()
  const [tokenInUi, setTokenInUi] = useState<null|string|undefined>(null)

  const logout = () => {
     signOut();
  }

  const callApi = () => {
    setTokenInUi(token?.current);
  }

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#FFFFFF'
      }}
    >
      <Text>Home</Text>
      <Button title={"Logout"} onPress={logout}/>
      <View style={{
        paddingTop: 20
      }} />
      <Text>Make an API call with the stored AUTH token</Text>
      <Button title={"Call API"} onPress={callApi} />
      {tokenInUi &&
        <Text>{`Your API access token is ${tokenInUi}`}</Text>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
