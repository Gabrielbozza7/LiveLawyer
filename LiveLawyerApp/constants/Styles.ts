import { Dimensions, StatusBar, StyleSheet } from 'react-native'
import { Colors } from './Colors'

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window')

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
  LawofficeName: {
    color: Colors.blue,
    fontSize: 34,
    marginBottom: 20,
  },
  nameText: {
    color: Colors.blue,
    fontSize: 24,
    marginBottom: 20,
  },
  phoneText: {
    fontSize: 18,
    color: Colors.blue,
    textDecorationLine: 'underline',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  videoRemote: {
    flex: 1, // Fills entire screen
    backgroundColor: Colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLocal: {
    position: 'absolute',
    width: WIDTH * 0.35, // 35% of the screen width
    height: HEIGHT * 0.25, // 25% of the screen height
    bottom: 45, // Positioned at bottom-right
    right: 15,
    backgroundColor: Colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  videoText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
})
