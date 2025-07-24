import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Breakpoint } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { CSSProperties, ReactNode } from 'react'

interface PageContentProps {
  title?: string
  width?: Breakpoint
  aboveTitle?: ReactNode
  alignItems?: CSSProperties['alignItems']
  children?: ReactNode
}

export function PageContent({ title, width, aboveTitle, alignItems, children }: PageContentProps) {
  return (
    <Container sx={{ marginTop: 3 }} maxWidth={width ?? 'lg'}>
      <Paper variant="elevation" elevation={3} sx={{ padding: 3 }}>
        <Stack alignItems={alignItems ?? 'flex-start'} spacing={3}>
          {aboveTitle !== undefined && aboveTitle}
          <Typography alignSelf="flex-start" variant="overline">
            {title}
          </Typography>
          {children}
        </Stack>
      </Paper>
    </Container>
  )
}
