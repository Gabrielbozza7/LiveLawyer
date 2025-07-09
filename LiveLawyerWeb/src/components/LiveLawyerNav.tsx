'use client'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import Container from '@mui/material/Container'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import logo from '@/assets/images/live-lawyer-logo.jpeg'
import Paper from '@mui/material/Paper'
import { ReactNode, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSupabaseClient, useUserType } from 'livelawyerlibrary/context-manager'
import { useRouter } from 'next/navigation'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'

export default function LiveLawyerNav() {
  const supabaseRef = useSupabaseClient()
  const userType = useUserType()
  const router = useRouter()
  const [anchorElementUser, setAnchorElementUser] = useState<HTMLElement | null>(null)

  const navPages = new Map<string, string>([
    ['Call', '/call'],
    ['History', '/history'],
  ])
  if (userType === 'Lawyer') {
    navPages.set('Legal', '/legal')
  }

  const menuPages = new Map<ReactNode, string | (() => Promise<unknown>)>([
    [
      <>
        <AccountCircleIcon sx={{ marginRight: 1 }} />
        <Typography>Account</Typography>
      </>,
      '/account',
    ],
    [
      <>
        <LogoutIcon sx={{ marginRight: 1 }} />
        <Typography>Logout</Typography>
      </>,
      async () => {
        await supabaseRef.current.auth.signOut()
        router.push('/')
      },
    ],
  ])

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElementUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElementUser(null)
  }

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Paper sx={{ display: 'flex', marginRight: 4 }} variant="outlined">
            <Image
              style={{ display: 'flex', width: 50, height: 50 }}
              alt="Live Lawyer logo"
              src={logo}
            />
          </Paper>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            sx={{
              marginRight: 4,
              display: 'flex',
              fontFamily: 'sans-serif',
              fontWeight: 400,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Live Lawyer Web
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            {Array.from(navPages.entries()).map(entry => (
              <Button
                key={entry[0]}
                LinkComponent={Link}
                href={entry[1]}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {entry[0]}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Account">
              <IconButton onClick={handleOpenUserMenu} sx={{ padding: 0 }}>
                <Avatar alt="Profile picture" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ marginTop: '45px' }}
              anchorEl={anchorElementUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={anchorElementUser !== null}
              onClose={handleCloseUserMenu}
            >
              {Array.from(menuPages.entries()).map((entry, index) => (
                <MenuItem
                  key={index}
                  onClick={async () => {
                    handleCloseUserMenu()
                    if (typeof entry[1] === 'string') {
                      router.push(entry[1])
                    } else {
                      await entry[1]()
                    }
                  }}
                >
                  {entry[0]}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
