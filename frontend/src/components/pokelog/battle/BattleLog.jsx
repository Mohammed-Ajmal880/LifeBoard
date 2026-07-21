import { useEffect, useRef } from 'react'

function BattleLog({ entries }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  const getEntryStyle = (entry) => {
    let colour = 'rgba(255,255,255,0.6)'
    let bold   = false
    let italic = false

    if (entry.includes('wins!') || entry.includes('fainted all')) {
      colour = '#fde047'; bold = true
    } else if (entry.includes('fainted')) {
      colour = '#f87171'; bold = true
    } else if (entry.includes('super effective')) {
      colour = '#34d399'; bold = true
    } else if (entry.includes('not very effective')) {
      colour = '#fbbf24'
    } else if (entry.includes('no effect')) {
      colour = '#71717a'; italic = true
    } else if (entry.includes('used')) {
      colour = '#7dd3fc'
    } else if (
      entry.includes('moves first') ||
      entry.includes('sent out') ||
      entry.includes('Switched')
    ) {
      colour = '#a78bfa'
    }

    return {
      fontSize:   '12px',
      color:      colour,
      margin:     0,
      lineHeight: 1.5,
      fontWeight: bold   ? 600    : 400,
      fontStyle:  italic ? 'italic' : 'normal',
      transition: 'color 0.2s',
    }
  }

  return (
    <div>
      <p style={{
        fontSize:      '10px',
        fontWeight:    600,
        color:         'var(--text-muted)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom:  '12px',
      }}>
        Battle log
      </p>

      <div style={{
        background:   'rgba(0,0,0,0.3)',
        border:       '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        padding:      '12px 14px',
        height:       '180px',
        overflowY:    'auto',
        display:      'flex',
        flexDirection:'column',
        gap:          '6px',
      }}>
        {entries.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Battle not yet started...
          </p>
        ) : (
          entries.map((entry, i) => (
            <div key={i} style={{
              display:    'flex',
              alignItems: 'flex-start',
              gap:        '8px',
            }}>
              <span style={{
                fontSize:   '10px',
                color:      'var(--text-muted)',
                marginTop:  '2px',
                flexShrink: 0,
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p style={getEntryStyle(entry)}>{entry}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default BattleLog