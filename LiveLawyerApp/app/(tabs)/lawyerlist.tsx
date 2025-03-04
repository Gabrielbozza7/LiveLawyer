import { Styles } from '@/constants/Styles'
import React from 'react'
import { FlatList, Text, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'

type ItemData = {
  id: string
  title: string
}
//Data place holder
var Data: ItemData[] = [
  {
    id: 'Lawyer_1',
    title: 'Saul Goodman',
  },
  {
    id: 'Lawyer_2',
    title: 'Harvey Spectre',
  },
  {
    id: 'Lawyer_3',
    title: 'Mike Ross',
  },
  {
    id: 'Lawyer_4',
    title: 'Louis Litt',
  },
]

type ItemProps = {
  item: ItemData
  onPress: () => void
}
const Item = ({ item, onPress }: ItemProps) => (
  <TouchableOpacity onPress={onPress} style={Styles.itemLawyer}>
    <Text style={Styles.title}>{item.title}</Text>
  </TouchableOpacity>
)
export default function LawyerView() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.container}>
        <FlatList
          data={Data}
          renderItem={({ item }) => (
            <Item item={item} onPress={() => Alert.alert('Selected Lawyer', item.title)} />
          )}
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
