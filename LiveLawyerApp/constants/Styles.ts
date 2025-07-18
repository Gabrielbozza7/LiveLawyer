import { Dimensions, StyleSheet } from 'react-native'
import { Colors } from './Colors'

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window')

export const Styles = StyleSheet.create({
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

export const newStyles = StyleSheet.create({
  centeredText: { textAlign: 'center' },
  boldText: { fontWeight: 'bold' },
  italicText: { fontStyle: 'italic' },
  spacedHeading: { textAlign: 'center', marginVertical: 24 },
  fab: { alignSelf: 'center' },
  spacedCard: { marginHorizontal: 36, marginVertical: 12 },
  centeredProminentAvatar: { alignSelf: 'center', marginVertical: 18 },
  bottomLeftFab: {
    position: 'absolute',
    margin: 18,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  bottomRightFab: {
    position: 'absolute',
    margin: 18,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  tabs: { marginVertical: 12, marginHorizontal: 24 },
  textInputIcon: { backgroundColor: Colors.transparent },
  logo: { height: '100%', aspectRatio: 1 },
  logoContainer: { width: '70%', aspectRatio: 1, alignSelf: 'center', marginTop: 12 },
})
