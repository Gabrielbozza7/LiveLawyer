/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tabs } from 'expo-router'
import { Platform } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import Octicons from '@expo/vector-icons/Octicons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hub',
          tabBarIcon: ({ focused, color, size }) => {
            return <Ionicons name="call" size={24} color="black" />
          },
        }}
      />
      <Tabs.Screen
        name="lawyerlist"
        options={{
          title: 'Lawyers',
          tabBarIcon: ({ focused, color, size }) => {
            return <Octicons name="law" size={24} color="black" />
          },
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ focused, color, size }) => {
            return <MaterialIcons name="contact-page" size={24} color="black" />
          },
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
          tabBarIcon: ({ focused, color, size }) => {
            return <FontAwesome name="info-circle" size={24} color="black" />
          },
        }}
      />
    </Tabs>
  )
}
