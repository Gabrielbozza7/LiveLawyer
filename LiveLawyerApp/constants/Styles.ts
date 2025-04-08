import { Dimensions, StatusBar, StyleSheet } from 'react-native'
import { Colors } from './Colors'

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window')
const { width: screenWidth } = Dimensions.get('window')
const imageHeight = (screenWidth * 14) / 16

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
  itemInfoBox: {
    backgroundColor: Colors.itemLawyerBackground,
    padding: 30,
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '90%',
  },
  // eslint-disable-next-line react-native/no-color-literals
  mainLogoButton: {
    width: screenWidth,
    height: imageHeight,
    borderRadius: 50,
    shadowColor: 'black',
    shadowOffset: { height: -5, width: -1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  name: {
    fontSize: 32,
    color: Colors.name,
  },
  phone: {
    fontSize: 16,
    color: Colors.phone,
    textDecorationLine: 'underline',
  },
  pageTitle: {
    fontSize: 40,
    textAlign: 'center',
    color: Colors.phone,
  },
  title: {
    fontSize: 25,
  },
  centeredText: { fontSize: 20, textAlign: 'center' },
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
  videoBottomContainer: {
    flexDirection: 'row', // Aligns buttons & video in a row
    position: 'absolute',
    bottom: 50, // Adjusts position from bottom
    left: 15,
    right: 15,
    width: WIDTH - 30, // Makes it stretch horizontally
    alignItems: 'center',
    justifyContent: 'space-between', // Keeps buttons on left, video on right
  },
  videoButtonContainer: {
    flexDirection: 'column', // Stacks buttons vertically
    alignItems: 'flex-start', // Aligns buttons to the left
    gap: 100, // Adds space between buttons
  },
  videoButton: {
    backgroundColor: Colors.red,
    paddingVertical: 15,
    paddingHorizontal: 15,
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
