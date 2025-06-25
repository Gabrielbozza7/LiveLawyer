import { useEffect, useState } from 'react'
import LiveLawyerApi from 'livelawyerlibrary/api/LiveLawyerApi'
import { CallHistorySingle } from 'livelawyerlibrary/api/types/call-history'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Styles } from '@/constants/Styles'
import { Text, Button, FlatList, View } from 'react-native'
import { supabase } from '../lib/supabase'
import { BACKEND_URL } from '@/constants/BackendVariables'
import { Colors } from '@/constants/Colors'

export default function History() {
  const [history, setHistory] = useState<CallHistorySingle[]>([])
  const [placeholder, setPlaceholder] = useState<string | null>('Loading...')

  useEffect(() => {
    refreshHistory()
  }, [])

  const refreshHistory = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    if (error || session === null) {
      setPlaceholder('Your session is invalid! Try restarting the app or logging in again.')
      return
    }
    const api = new LiveLawyerApi(BACKEND_URL, session.access_token)
    try {
      const response = await api.fetchCallHistory()
      if (response.history) {
        setHistory(response.history)
      }
    } catch (error) {
      console.log((error as Error).message)
      setPlaceholder('Something went wrong when trying to fetch your history! Try again later.')
      return
    }
    setPlaceholder(null)
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={Styles.container}>
        {placeholder === null ? (
          <FlatList
            data={history}
            renderItem={entry => (
              <View style={Styles.itemInfoBox}>
                <Text style={Styles.callHistorySingleText}>
                  <Text style={Styles.callHistorySingleLabel}>Date/Time: </Text>
                  {new Date(entry.item.startTime).toLocaleString()}
                  {'\n'}
                  <Text style={Styles.callHistorySingleLabel}>Client: </Text>
                  {entry.item.clientName}
                  {'\n'}
                  <Text style={Styles.callHistorySingleLabel}>Observer: </Text>
                  {entry.item.observerName}
                  {'\n'}
                  <Text style={Styles.callHistorySingleLabel}>Lawyer: </Text>
                  {entry.item.lawyerName ?? <Text style={Styles.callHistorySingleNone}>None</Text>}
                  {'\n'}
                  <Text style={Styles.callHistorySingleLabel}>ID: </Text>
                  {entry.item.id}
                </Text>
              </View>
            )}
            keyExtractor={entry => entry.id}
            ListFooterComponent={
              <Button
                onPress={refreshHistory}
                title="Refresh"
                color={Colors.blue}
                accessibilityLabel="Refresh the call history."
              />
            }
          />
        ) : (
          <Text style={Styles.localText}>{placeholder}</Text>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
