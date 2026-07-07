import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useState } from 'react'

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-primary)'
    }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0
      }}>
        <TopBar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--bg-primary)'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout