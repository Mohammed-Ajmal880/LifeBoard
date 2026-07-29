function HPBar({ current, max, label, sublabel }) {
  const pct     = max > 0 ? Math.round((current / max) * 100) : 0
  const colour  = pct > 50 ? '#4ade80' : pct > 20 ? '#facc15' : '#f87171'

  return (
    <div>
      {label && (
        <p style={{
          fontSize:      '10px',
          fontWeight:    600,
          color:         'var(--text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom:  '4px',
        }}>
          {label}
        </p>
      )}
      {sublabel && (
        <p style={{
          fontSize:     '15px',
          fontWeight:   700,
          color:        '#fff',
          marginBottom: '8px',
        }}>
          {sublabel}
        </p>
      )}
      <div style={{
        height:       '8px',
        background:   'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        overflow:     'hidden',
        marginBottom: '4px',
      }}>
        <div style={{
          height:     '100%',
          width:      `${pct}%`,
          background: colour,
          borderRadius:'4px',
          transition: 'width 0.5s ease, background 0.3s ease',
        }} />
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>
        {current} / {max} HP
      </p>
    </div>
  )
}

export default HPBar