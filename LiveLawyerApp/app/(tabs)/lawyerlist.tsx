import { Styles } from '@/constants/Styles'
import React, { useState } from 'react'
import { FlatList, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import LawyerInfo from '../lawyer_info/lawyer_info'

type ItemData = {
  id: string
  office: string
  title: string
  number: string
}
//Data place holder
var Data: ItemData[] = [
  {
    id: 'Lawyer_1',
    office: 'Goodman Law Office',
    title: 'Saul Goodman',
    number: '123-456-7890',
  },
  {
    id: 'Lawyer_2',
    office: 'Spectre Law Office',
    title: 'Harvey Spectre',
    number: '123-456-7891',
  },
  {
    id: 'Lawyer_3',
    office: 'Ross Law Office',
    title: 'Mike Ross',
    number: '123-456-7892',
  },
  {
    id: 'Lawyer_4',
    office: 'Litt Law Office',
    title: 'Louis Litt',
    number: '123-456-7893',
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
  const [lawyer, setLawyer] = useState<ItemData | null>(null)

  return (
    <SafeAreaProvider>
      {lawyer ? (
        <LawyerInfo onPressBack={() => setLawyer(null)} lawyer={
        lawyer}></LawyerInfo>
      ) : (
        <SafeAreaView style={Styles.container}>
          <FlatList
            data={Data}
            renderItem={({ item }) => <Item item={item} onPress={() => setLawyer(item)} />}
            keyExtractor={item => item.id}
          />
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  )
}
