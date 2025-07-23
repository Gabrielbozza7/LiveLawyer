import { StyleSheet } from 'react-native'
import { Colors } from './Colors'

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
  staticPositioning: { position: 'static' },
  rowContainer: { flexDirection: 'row' },
})
