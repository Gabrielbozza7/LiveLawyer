import { Tabs } from 'expo-router'
import { Platform, TouchableOpacity } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import Octicons from '@expo/vector-icons/Octicons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useRouter } from 'expo-router'
import { Styles } from '@/constants/Styles'

export default function TabsLayout() {
  const router = useRouter()

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: 'Live Lawyer',
        headerRight: () => (
          <TouchableOpacity onPress={() => router.push('/profile')} style={Styles.profileIcon}>
            <Ionicons name="person-circle-outline" size={26} />
          </TouchableOpacity>
        ),
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
          tabBarIcon: () => <Ionicons name="call" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="lawyers"
        options={{
          title: 'Lawyers',
          tabBarIcon: () => <Octicons name="law" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: () => <MaterialIcons name="contact-page" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Call History',
          tabBarIcon: () => <MaterialIcons name="book" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
          tabBarIcon: () => <FontAwesome name="info-circle" size={24} color="black" />,
        }}
      />
    </Tabs>
  )
}
