import * as SMS from 'expo-sms'
import { Alert, Platform } from 'react-native'
export default async function notifyContacts(
  contactList: string,
  lat: number,
  lon: number,
  name: string,
) {
  const isAvailable = await SMS.isAvailableAsync()

  if (isAvailable) {
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${`${lat},${lon}`}`,
      android: `geo:0,0?q=${`${lat},${lon}`}`,
    })
    const message = `${name} got pulled over. At location. My Current location is ${url}`

    SMS.sendSMSAsync(contactList, message)
  } else {
    Alert.alert('CANNOT SEND MESSAGE')
  }
}
