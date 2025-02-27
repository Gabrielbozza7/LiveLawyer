import { StatusBar, StyleSheet } from 'react-native'
import { Colors } from './Colors'

export const Styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: Colors.containerBackground,
  },
  item: {
    backgroundColor: Colors.itemBackground,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  itemLawyer: {
    backgroundColor: Colors.itemLawyerBackground,
    padding: 20,
    marginVertical: 4,
    marginHorizontal: 15,
  },
  name: {
    fontSize: 32,
    color: Colors.name,
  },
  phone: {
    fontSize: 16,
    color: Colors.phone,
  },
  pageTitle: {
    fontSize: 40,
    textAlign: 'center',
  },
  title: {
    fontSize: 25,
  },
  centeredText: { textAlign: 'center' },
})
