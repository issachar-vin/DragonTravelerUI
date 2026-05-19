import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const NAV_LINKS = [
  { label: 'Tier List', to: '/' },
  { label: 'Gear', to: '/gear' },
  { label: 'Team Builder', to: '/team-builder' },
  { label: 'My Teams', to: '/teams' },
]

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  const navBtnSx = (to: string) => ({
    color: isActive(to) ? 'primary.main' : 'text.primary',
    fontWeight: isActive(to) ? 700 : 400,
    borderBottom: isActive(to) ? '2px solid' : '2px solid transparent',
    borderColor: isActive(to) ? 'primary.main' : 'transparent',
    borderRadius: 0,
    pb: 0.25,
    minWidth: 0,
  })

  const handleLogout = () => {
    setMenuAnchor(null)
    setDrawerOpen(false)
    logout()
    navigate('/')
  }

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              mr: 3,
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            Dragon Travelers Guide
          </Typography>

          {isMobile ? (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton edge="end" color="inherit" onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <>
              {NAV_LINKS.map(({ label, to }) => (
                <Button key={to} component={Link} to={to} sx={{ ...navBtnSx(to), mr: 0.5 }}>
                  {label}
                </Button>
              ))}
              <Box sx={{ flexGrow: 1 }} />
              {user ? (
                <>
                  <Button
                    onClick={(e) => setMenuAnchor(e.currentTarget)}
                    size="small"
                    endIcon={<KeyboardArrowDownIcon />}
                    sx={{ color: 'text.secondary', textTransform: 'none' }}
                  >
                    {user.email}
                  </Button>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                    slotProps={{ paper: { sx: { bgcolor: 'background.paper', minWidth: 160 } } }}
                  >
                    {user.role === 'admin' && (
                      <MenuItem
                        component={Link}
                        to="/admin"
                        onClick={() => setMenuAnchor(null)}
                        sx={{ color: 'primary.main', fontWeight: 600 }}
                      >
                        Admin Panel
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login" sx={navBtnSx('/login')}>
                    Login
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    Register
                  </Button>
                </>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { bgcolor: 'background.paper', minWidth: 220 } } }}
      >
        <Box sx={{ pt: 2 }}>
          <List>
            {NAV_LINKS.map(({ label, to }) => (
              <ListItem key={to} disablePadding>
                <ListItemButton
                  component={Link}
                  to={to}
                  selected={isActive(to)}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontWeight: isActive(to) ? 700 : 400,
                          color: isActive(to) ? 'primary.main' : 'inherit',
                        }}
                      >
                        {label}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {user ? (
              <>
                <ListItem>
                  <ListItemText secondary={user.email} />
                </ListItem>
                {user.role === 'admin' && (
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      to="/admin"
                      selected={isActive('/admin')}
                      onClick={() => setDrawerOpen(false)}
                      sx={{ color: 'primary.main' }}
                    >
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>
                            Admin Panel
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                )}
                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/login"
                    selected={isActive('/login')}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <ListItemText primary="Login" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/register"
                    selected={isActive('/register')}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <ListItemText primary="Register" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  )
}
