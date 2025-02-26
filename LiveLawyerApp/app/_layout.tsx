import { Stack, Tabs } from "expo-router";
import { Platform } from "react-native";

export default function RootLayout() {
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
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hub',
        }}
      />
      <Tabs.Screen
        name="lawyer"
        options={{
          title: 'Lawyer',
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
        }}
      />
    </Tabs>
  );
}
