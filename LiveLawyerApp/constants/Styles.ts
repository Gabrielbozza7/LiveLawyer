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
  lawyerlogo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },

  // this is for lawyer info page
  // eslint-disable-next-line react-native/no-color-literals
  LawofficeName: {
    color: 'blue',
    fontSize: 34,
    marginBottom: 20,
  },
  // eslint-disable-next-line react-native/no-color-literals
  nameText: {
    color: 'blue',
    fontSize: 24,
    marginBottom: 20,
  },
  // eslint-disable-next-line react-native/no-color-literals
  phoneText: {
    fontSize: 18,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  // eslint-disable-next-line react-native/no-color-literals
  goBackButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  // eslint-disable-next-line react-native/no-color-literals
  goBackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // this ithe end of lawyer info page
})
