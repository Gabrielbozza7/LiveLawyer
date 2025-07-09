'use client'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { AlertMessage, useAlerter } from 'livelawyerlibrary/context-manager'
import { useEffect, useState } from 'react'

export default function AlertDelivery() {
  const alerterRef = useAlerter()
  const [message, setMessage] = useState<AlertMessage | null>(null)
  const [open, setOpen] = useState<boolean>(false)

  const showAlert = (message: AlertMessage) => {
    setMessage(message)
    setOpen(true)
  }

  const hideAlert = async () => {
    setOpen(false)
    await new Promise(resolve => setTimeout(resolve, 500))
    if (!open) {
      setMessage(null)
    }
  }

  useEffect(() => {
    const alerter = alerterRef.current
    alerter.addCallback(showAlert)
    return () => {
      alerter.removeCallback(showAlert)
    }
  }, [alerterRef])

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={4000}
      onClose={hideAlert}
    >
      <Alert
        severity={message === null ? 'info' : message.kind === 'SUCCESS' ? 'success' : 'error'}
        variant="filled"
        sx={{ width: '100%' }}
        onClose={hideAlert}
      >
        {message?.message}
      </Alert>
    </Snackbar>
  )
}
