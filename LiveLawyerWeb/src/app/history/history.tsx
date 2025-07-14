'use client'
import { useEffect, useState } from 'react'
import { CallHistorySingle } from 'livelawyerlibrary/api/types/call-history'
import { HistoryEntry } from './history-entry'
import { useApi } from 'livelawyerlibrary/context-manager'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { PageContent } from '@/components/ui/page-content'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'

export function History() {
  const apiRef = useApi()
  const [history, setHistory] = useState<CallHistorySingle[] | null | undefined>(undefined)

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
        }
      })()
    }
  }, [apiRef, history])

  return (
    <PageContent title="Call History">
      {history === undefined ? (
        <CircularProgress />
      ) : history === null ? (
        <Alert severity="error" variant="filled">
          Something went wrong when trying to fetch your history! Try again later.
        </Alert>
      ) : (
        <>
          {history.length > 0 ? (
            <Stack alignItems="stretch" spacing={2} sx={{ width: '100%' }}>
              {history.map(entry => (
                <HistoryEntry key={entry.id} entry={entry}></HistoryEntry>
              ))}
            </Stack>
          ) : (
            <Typography variant="body1">Your call history is empty.</Typography>
          )}
        </>
      )}
      <Button variant="contained" onClick={() => setHistory(undefined)}>
        Refresh
      </Button>
    </PageContent>
  )
}
