/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import { View } from 'react-native'
import { FAB, Icon } from 'react-native-paper'

export function WeirdFabs() {
  return (
    <>
      <FAB icon="plus" label="ye" onPress={() => console.log('Pressed')} />
      <FAB
        icon={({ size, color }) => (
          <View
            style={{
              backgroundColor: 'blue',
              position: 'absolute',
              right: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon source="phone" color={color} size={size} />
          </View>
        )}
        uppercase={true}
        theme={{
          colors: {
            elevation: { level3: 'rgb(231, 13, 13)' },
          },
        }}
        color="white"
        customSize={300}
        variant="surface"
        onPress={() => console.log('Pressed')}
      />
    </>
  )
}
