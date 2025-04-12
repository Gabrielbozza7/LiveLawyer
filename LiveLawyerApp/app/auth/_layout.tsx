import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function AuthLayout() {
  return (
    <>
      <Stack />
      <View style={{ position: 'absolute', top: 40, left: 20 }}>
        <Text>Inside auth layout ✅</Text>
      </View>
    </>
  );
}
