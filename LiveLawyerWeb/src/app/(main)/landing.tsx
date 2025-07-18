import { PageContent } from '@/components/ui/page-content'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Link from 'next/link'

export default function Landing() {
  return (
    <PageContent title="Live Lawyer Web">
      <Typography variant="h5">Welcome to Live Lawyer Web.</Typography>
      <Typography variant="body1">
        To start your call with a client in the call page, click if you are an observer or a lawyer.
      </Typography>
      <Button variant="contained" LinkComponent={Link} href="/call">
        Go to Call Page
      </Button>
    </PageContent>
  )
}
