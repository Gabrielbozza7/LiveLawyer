import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'

export default function Landing() {
  return (
    <>
      <title>Live Lawyer Web</title>
      <Container sx={{ marginTop: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="overline">Live Lawyer Web</Typography>
              <Typography variant="h5">Welcome to Live Lawyer Web.</Typography>
              <Typography variant="body1">
                To start your call with a client in the call page, click if you are an observer or a
                lawyer.
              </Typography>
            </Stack>
          </CardContent>
          <CardActions>
            <Button size="small" LinkComponent={Link} href="/call">
              Go to Call Page
            </Button>
          </CardActions>
        </Card>
      </Container>
    </>
  )
}
