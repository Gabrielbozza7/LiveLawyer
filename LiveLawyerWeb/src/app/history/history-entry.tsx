import { useEffect, useState } from 'react'
import {
  CallHistoryDetailsSingle,
  CallHistorySingle,
} from 'livelawyerlibrary/api/types/call-history'
import { useAlerter, useApi } from 'livelawyerlibrary/context-manager'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import Grid from '@mui/material/Grid'

interface HistoryEntryProps {
  entry: CallHistorySingle
}

export function HistoryEntry({ entry }: HistoryEntryProps) {
  const alerterRef = useAlerter()
  const apiRef = useApi()
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [details, setDetails] = useState<CallHistoryDetailsSingle | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(false)
  const [sentRequest, setSentRequest] = useState<boolean>(false)
  const [attemptingDownload, setAttemptingDownload] = useState<boolean>(false)

  useEffect(() => {
    if (showDetails && !sentRequest) {
      setLoading(true)
      setSentRequest(true)
      apiRef.current
        .fetchCallDetails(entry.id)
        .then(response => {
          setDetails(response.details)
        })
        .catch(() => {
          setShowDetails(false)
          setSentRequest(false)
          alerterRef.current.error(`Something went wrong when trying to fetch the details!`)
        })
        .finally(() => setLoading(false))
    }
  }, [alerterRef, apiRef, entry.id, sentRequest, showDetails])

  const attemptDownload = async (recordingId: string) => {
    setAttemptingDownload(true)
    try {
      const response = await apiRef.current.fetchCallDownload(recordingId)
      window.open(response.downloadLink, '_self')
    } catch (error) {
      alerterRef.current.error(`Error: ${(error as Error).message}`)
    } finally {
      setAttemptingDownload(false)
    }
  }

  return (
    <Card variant="elevation">
      <CardContent>
        <Typography variant="body1">
          <strong>Date/Time:</strong> {new Date(entry.startTime).toLocaleString()}
          <br />
          <strong>Client:</strong> {entry.clientName}
          <br />
          <strong>Observer:</strong> {entry.observerName}
          <br />
          <strong>Lawyer:</strong> {entry.lawyerName ?? <i>None</i>}
          <br />
          <strong>ID:</strong> {entry.id}
          <br></br>
        </Typography>
      </CardContent>
      <CardActions>
        <Stack spacing={2}>
          <Button size="small" onClick={() => setShowDetails(showDetails => !showDetails)}>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          {showDetails && (
            <Grid container spacing={2}>
              {loading ? (
                <CircularProgress />
              ) : details !== undefined ? (
                <>
                  <Grid size={6}>
                    <Typography variant="overline">Call Events</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="overline">Call Recordings</Typography>
                  </Grid>
                  <Grid size={6} display="flex">
                    {details.events.length > 0 ? (
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Timestamp</TableCell>
                              <TableCell>User</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {details.events.map((event, index) => (
                              <TableRow key={index}>
                                <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                                <TableCell>{event.userName}</TableCell>
                                <TableCell>{event.action}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body1">There are no events available.</Typography>
                    )}
                  </Grid>
                  <Grid size={6} display="flex">
                    {details.recordings.length > 0 ? (
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Start Timestamp</TableCell>
                              <TableCell>User</TableCell>
                              <TableCell>File Type</TableCell>
                              <TableCell>Download</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {details.recordings.map((recording, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {new Date(recording.startTime).toLocaleString()}
                                </TableCell>
                                <TableCell>{recording.userName}</TableCell>
                                <TableCell>{recording.trackType}</TableCell>
                                <TableCell>
                                  <Button
                                    disabled={attemptingDownload}
                                    onClick={() => attemptDownload(recording.id)}
                                  >
                                    Download
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body1">There are no recordings available.</Typography>
                    )}
                  </Grid>
                </>
              ) : (
                <Typography variant="body1">Call details for this call are unavailable.</Typography>
              )}
            </Grid>
          )}
        </Stack>
      </CardActions>
    </Card>
  )
}
