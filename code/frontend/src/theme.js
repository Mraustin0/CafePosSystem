import { createTheme } from '@mui/material/styles'

// Shared look for every page — change colors here, not inside pages.
const theme = createTheme({
  palette: {
    primary: { main: '#6f4e37' },
    secondary: { main: '#c8a27a' },
    background: { default: '#faf7f2' },
  },
  shape: { borderRadius: 10 },
})

export default theme
