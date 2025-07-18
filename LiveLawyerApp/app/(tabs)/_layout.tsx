import { Tabs } from 'expo-router'
import { useRouter } from 'expo-router'
import { newStyles } from '@/constants/Styles'
import { Appbar, BottomNavigation, Icon, Text } from 'react-native-paper'

export default function TabsLayout() {
  const router = useRouter()

  return (
    <Tabs
      screenOptions={{
        header: ({ options }) => (
          <Appbar.Header elevated>
            <Appbar.Content title={options.title} />
            <Appbar.Action
              icon="account-cog"
              onPress={() => router.push('/screens/account')}
              style={newStyles.textInputIcon}
            />
          </Appbar.Header>
        ),
      }}
      tabBar={({ navigation, state, descriptors }) => (
        <BottomNavigation.Bar
          navigationState={state}
          onTabPress={({ route }) => {
            navigation.navigate(route.name)
          }}
          renderIcon={({ route, focused, color }) => {
            const size = focused ? 28 : 24
            const renderIcon = descriptors[route.key].options.tabBarIcon
            return renderIcon !== undefined ? (
              renderIcon({ focused, color, size })
            ) : (
              <Icon source="close" color={color} size={size} />
            )
          }}
          renderLabel={({ route }) => {
            let label = descriptors[route.key].options.tabBarLabel
            if (typeof label !== 'string') {
              label = 'UNNAMED'
            }
            return (
              <Text variant="labelSmall" style={newStyles.centeredText}>
                {label}
              </Text>
            )
          }}
        />
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Call Observer',
          tabBarLabel: 'Call',
          tabBarIcon: ({ color, size }) => <Icon source="phone" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="lawyers"
        options={{
          title: 'Browse Law Offices',
          tabBarLabel: 'Lawyers',
          tabBarIcon: ({ color, size }) => (
            <Icon source="scale-balance" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Emergency Contacts',
          tabBarLabel: 'Contacts',
          tabBarIcon: ({ color, size }) => (
            <Icon source="account-multiple" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Call History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => <Icon source="history" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Legal Resources',
          tabBarLabel: 'Resources',
          tabBarIcon: ({ color, size }) => (
            <Icon source="information-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}
