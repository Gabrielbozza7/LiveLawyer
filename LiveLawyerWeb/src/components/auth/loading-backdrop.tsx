'use client'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

export function LoadingBackdrop() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress size={100} />
    </Box>
  )
}
