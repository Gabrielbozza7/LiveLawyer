import { Styles } from '@/constants/Styles'
import { Text, View, Button, Alert, Linking, TouchableOpacity } from 'react-native'
import { FlatList } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'

const DATA = [
  {
    id: '1',
    name: 'Mom',
    phone: '(012) - 345 - 6789',
  },
  {
    id: '2',
    name: 'Dad',
    phone: '(111) - 111 - 1111',
  },
  {
    id: '3',
    name: 'Contact Three',
    phone: '(222) - 222 - 2222',
  },
]

type ItemProps = { name: string; phone: string }
const handleCall = (DATA: string) => {
     Linking.openURL(`tel:${DATA}`)
   }

const Item = ({ name, phone }: ItemProps) => (
  <View style={Styles.item}>
    <Text style={Styles.name}>{name}</Text>
    <TouchableOpacity onPress={()=>handleCall(phone)}>
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
        />
      </SafeAreaView>
      <SafeAreaView style={Styles.container}>
        <Button
          onPress={() => {
            Alert.alert('Contact button pressed.')
          }}
          title="Add Contact"
          color="#0000ff"
          accessibilityLabel="Add a contact to the contact list."
        />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
