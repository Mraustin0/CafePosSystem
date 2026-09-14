import { Chip, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material'

/** Temporary content for pages that are not built yet. Replace the whole page when you start. */
export default function PagePlaceholder({ title, owner, functions = [], endpoints = [] }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">{title}</Typography>
        <Chip label={`ผู้รับผิดชอบ: ${owner}`} color="secondary" />
      </Stack>
      <Typography variant="subtitle2">ฟังก์ชัน (doc/system-functions.md)</Typography>
      <List dense>
        {functions.map((f) => <ListItem key={f}><ListItemText primary={f} /></ListItem>)}
      </List>
      <Typography variant="subtitle2">API (ดูรายละเอียดที่ /swagger-ui.html)</Typography>
      <List dense>
        {endpoints.map((e) => <ListItem key={e}><ListItemText primary={e} slotProps={{ primary: { fontFamily: 'monospace' } }} /></ListItem>)}
      </List>
    </Paper>
  )
}
