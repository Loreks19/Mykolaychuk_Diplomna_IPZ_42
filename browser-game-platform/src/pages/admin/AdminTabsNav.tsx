import {
  Paper,
  Tab,
  Tabs,
} from '@mui/material'
import type { AdminTab } from './types'

type AdminTabsNavProps = {
  activeTab: AdminTab
  onChange: (tab: AdminTab) => void
}

function AdminTabsNav({ activeTab, onChange }: AdminTabsNavProps) {
  return (
    <Paper sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
      <Tabs value={activeTab} onChange={(_, value: AdminTab) => onChange(value)} variant="scrollable">
        <Tab label="Ігри" value="games" />
        <Tab label="Жанри" value="genres" />
        <Tab label="Коментарі" value="comments" />
      </Tabs>
    </Paper>
  )
}

export default AdminTabsNav
