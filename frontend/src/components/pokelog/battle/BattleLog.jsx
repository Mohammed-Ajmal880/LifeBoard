import { useEffect, useRef } from 'react'

function BattleLog({ entries }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

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
          entries.map((entry, i) => {
            const isSystem  = entry.startsWith('All of') || entry.includes('wins!')
            const isFaint   = entry.includes('fainted')
            const isSuper   = entry.includes('super effective')
            const isNotVery = entry.includes('not very effective')
            const isNoEffect= entry.includes('no effect')

            let colour = 'var(--text-secondary)'
            if (isSystem)   colour = '#a78bfa'
            if (isFaint)    colour = '#f87171'
            if (isSuper)    colour = '#4ade80'
            if (isNotVery)  colour = '#facc15'
            if (isNoEffect) colour = '#f87171'

            return (
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
                <p style={{
                  fontSize:   '12px',
                  color:      colour,
                  margin:     0,
                  lineHeight: 1.5,
                  fontWeight: isSystem || isFaint ? 600 : 400,
                }}>
                  {entry}
                </p>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default BattleLog