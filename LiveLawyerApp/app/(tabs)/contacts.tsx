import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'
//import notifyContacts from '@/components/emergencyNotif'
import { Text, View, Button, Alert, Linking, TouchableOpacity, FlatList } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
//import { getCoordinates } from '@/components/locationStore'

const DATA = [
  { id: '1', name: 'Mom', phone: '(012)-345-6789' },
  { id: '2', name: 'Dad', phone: '(111) - 111 - 1111' },
  { id: '3', name: 'Contact Three', phone: '(222) - 222 - 2222' },
]

// const currentCoordinate = getCoordinates()
// const currLon = currentCoordinate?.lat ?? 0
// const currLat = currentCoordinate?.lon ?? 0
type ItemProps = { name: string; phone: string }
const handleCall = (DATA: string) => {
  Linking.openURL(`tel:${DATA}`)
}

const Item = ({ name, phone }: ItemProps) => (
  <View style={Styles.itemInfoBox}>
    <Text style={Styles.name}>{name}</Text>
    <TouchableOpacity onPress={() => handleCall(phone)}>
      <Text style={Styles.phone}>{phone}</Text>
    </TouchableOpacity>
  </View>
)

export default function Index() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.container}>
        <FlatList
          data={DATA}
          renderItem={({ item }) => <Item name={item.name} phone={item.phone} />}
          keyExtractor={item => item.id}
          ListFooterComponent={
            <Button
              onPress={() => {
                Alert.alert('Contact button pressed.')
                //notifyContacts(DATA[0].phone, currLon, currLat, DATA[0].name)
              }}
              title="Add Contact"
              color={Colors.blue}
              accessibilityLabel="Add a contact to the contact list."
            />
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
