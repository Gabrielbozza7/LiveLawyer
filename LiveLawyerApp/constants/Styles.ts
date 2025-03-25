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
  LawyerInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.containerBackground,
  },
  lawyerlogo:{
    flex: 1,
    width: 750,
    height: 550,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  LawofficeName: {
    color: 'blue',
    fontSize: 34,
    marginBottom: 20,
  },
  nameText: {
    color: 'blue',
    fontSize: 24,
    marginBottom: 20,
  },
  phoneText: {
    fontSize: 18,
    color: 'blue',
    textDecorationLine: 'underline',
  },
})
