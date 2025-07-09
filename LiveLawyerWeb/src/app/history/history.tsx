'use client'
import { useCallback, useEffect, useState } from 'react'
import { CallHistorySingle } from 'livelawyerlibrary/api/types/call-history'
import { HistoryEntry } from './history-entry'
import { useAlerter, useApi } from 'livelawyerlibrary/context-manager'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

export function History() {
  const alerterRef = useAlerter()
  const apiRef = useApi()
  const [history, setHistory] = useState<CallHistorySingle[] | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(false)

  const refreshHistory = useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiRef.current.fetchCallHistory()
      if (response.history) {
        setHistory(response.history)
      }
    } catch (error) {
      console.log((error as Error).message)
      alerterRef.current.error(
        'Something went wrong when trying to fetch your history! Try again later.',
      )
    }
    setLoading(false)
  }, [alerterRef, apiRef])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  return (
    <Container sx={{ marginTop: 4 }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="overline">Call History</Typography>
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                {history === undefined ? (
                  <Typography variant="body1">Your call history could not be loaded.</Typography>
                ) : history.length > 0 ? (
                  <>
                    {history.map(entry => (
                      <HistoryEntry key={entry.id} entry={entry}></HistoryEntry>
                    ))}
                  </>
                ) : (
                  <Typography variant="body1">Your call history is empty.</Typography>
                )}
              </>
            )}
            <Button variant="contained" onClick={refreshHistory}>
              Refresh
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
