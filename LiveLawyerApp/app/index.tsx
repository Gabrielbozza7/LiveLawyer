import React, { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

export default function Index() {
  const [times, setTimes] = useState<number>(0);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{fontSize: 40, verticalAlign: 'bottom'}}>Hub{'\n\n\n'}</Text>
      <Button
          title='CALL LAWYER'
          onPress={() => {
            Alert.alert('You are now chatting with a lawyer!');
            setTimes(times + 1);
          }}
      />
      <Text style={{textAlign: 'center', verticalAlign: 'bottom'}}>
        (Pretend the button works.){'\n\n\n\n\n'}You have called a lawyer {times} times.
      </Text>
    </View>
  );
}
