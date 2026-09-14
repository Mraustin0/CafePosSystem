import { NavLink, Outlet } from 'react-router-dom'
import {
  AppBar, Box, Button, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,
} from '@mui/material'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CategoryIcon from '@mui/icons-material/Category'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import LocalCafeIcon from '@mui/icons-material/LocalCafe'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
import PersonIcon from '@mui/icons-material/Person'
import { useAuth } from '../auth/useAuth'

const DRAWER_WIDTH = 220

// Add a menu entry here when you add a page. roles omitted = everyone logged in.
const NAV_ITEMS = [
  { to: '/pos', label: 'หน้าขาย', icon: <PointOfSaleIcon /> },
  { to: '/orders', label: 'ออเดอร์', icon: <ReceiptLongIcon /> },
  { to: '/categories', label: 'หมวดหมู่', icon: <CategoryIcon />, roles: ['ADMIN'] },
  { to: '/add-ons', label: 'Add-on', icon: <AddCircleIcon />, roles: ['ADMIN'] },
  { to: '/products', label: 'สินค้า', icon: <LocalCafeIcon />, roles: ['ADMIN'] },
  { to: '/users', label: 'ผู้ใช้', icon: <PeopleIcon />, roles: ['ADMIN'] },
  { to: '/reports', label: 'รายงาน', icon: <BarChartIcon />, roles: ['ADMIN'] },
  { to: '/profile', label: 'โปรไฟล์', icon: <PersonIcon /> },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role))

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Cafe POS</Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>{user.fullName} ({user.role})</Typography>
          <Button color="inherit" onClick={logout}>ออกจากระบบ</Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
      >
        <Toolbar />
        <List>
          {items.map((item) => (
            <ListItemButton key={item.to} component={NavLink} to={item.to} sx={{ '&.active': { bgcolor: 'action.selected' } }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
