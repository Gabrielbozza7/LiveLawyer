import { useEffect, useState } from 'react'
import { CallHistorySingle } from 'livelawyerlibrary/api/types/call-history'
import { newStyles } from '@/constants/Styles'
import { FlatList } from 'react-native'
import { useApi } from 'livelawyerlibrary/context-manager'
import { TabPage } from '@/components/ui/tab-page'
import { ActivityIndicator, Card, FAB, Text } from 'react-native-paper'
import { ErrorBanner } from '@/components/ui/error-banner'

function HistoryEntry({ entry }: { entry: CallHistorySingle }) {
  return (
    <Card style={newStyles.spacedCard}>
      <Card.Content>
        <Text variant="bodyMedium">
          <Text variant="titleMedium">Date/Time: </Text>
          {new Date(entry.startTime).toLocaleString()}
          {'\n'}
          <Text variant="titleMedium">Client: </Text>
          {entry.clientName}
          {'\n'}
          <Text variant="titleMedium">Observer: </Text>
          {entry.observerName}
          {'\n'}
          <Text variant="titleMedium">Lawyer: </Text>
          {entry.lawyerName ?? <Text style={newStyles.italicText}>None</Text>}
        </Text>
      </Card.Content>
    </Card>
  )
}

export default function History() {
  const apiRef = useApi()
  const [history, setHistory] = useState<CallHistorySingle[] | null | undefined>(undefined)

  // Refreshing history:
  useEffect(() => {
    if (history === undefined) {
      ;(async () => {
        try {
          const response = await apiRef.current.fetchCallHistory()
          if (response.history) {
            setHistory(response.history)
          }
        } catch (error) {
          console.log((error as Error).message)
          setHistory(null)
          return
        }
      })()
    }
  }, [history])

  return (
    <TabPage>
      {history === undefined ? (
        <ActivityIndicator />
      ) : history === null ? (
        <ErrorBanner text="Something went wrong when trying to fetch your history! Try again later." />
      ) : (
        <FlatList
          data={history}
          renderItem={entry => <HistoryEntry entry={entry.item} />}
          keyExtractor={entry => entry.id}
        />
      )}
      <FAB
        icon="refresh"
        onPress={() => setHistory(undefined)}
        mode="elevated"
        variant="surface"
        style={newStyles.bottomLeftFab}
      />
    </TabPage>
  )
}
