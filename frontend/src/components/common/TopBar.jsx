function TopBar({ collapsed, setCollapsed }) {
  return (
    <header style={{
      height:          'var(--header-height)',
      background:      'rgba(17,17,31,0.7)',
      borderBottom:    '1px solid var(--glass-border-strong)',
      backdropFilter:  'blur(20px)',
      display:         'flex',
      alignItems:      'center',
      padding:         '0 24px',
      gap:             '16px',
      flexShrink:      0,
    }}>
      {/* Sidebar toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          background:    'none',
          border:        'none',
          color:         'var(--text-muted)',
          fontSize:      '18px',
          cursor:        'pointer',
          padding:       '4px',
          borderRadius:  '6px',
          transition:    'color 0.2s',
          flexShrink:    0,
          display:       'flex',
          alignItems:    'center',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        ☰
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />
    </header>
  )
}

export default TopBar