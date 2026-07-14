import { TYPE_BADGE_COLOURS } from '../../../constants/typeColours'

function MoveSelector({ moves, onSelectMove, disabled }) {
  if (!moves || moves.length === 0) return null

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
        Choose a move
      </p>

      <div style={{
        display:             'grid',
        gridTemplateColumns: '1fr 1fr',
        gap:                 '8px',
      }}>
        {moves.map((move, i) => {
          const tc = TYPE_BADGE_COLOURS[move.type] || { bg: 'rgba(255,255,255,0.1)', color: '#fff' }
          return (
            <button
              key={i}
              onClick={() => !disabled && onSelectMove(move)}
              disabled={disabled}
              style={{
                background:   'rgba(255,255,255,0.04)',
                border:       '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding:      '12px 14px',
                cursor:       disabled ? 'not-allowed' : 'pointer',
                textAlign:    'left',
                transition:   'all 0.2s',
                opacity:      disabled ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                if (!disabled) {
                  e.currentTarget.style.background   = 'rgba(124,58,237,0.15)'
                  e.currentTarget.style.borderColor  = 'rgba(124,58,237,0.4)'
                  e.currentTarget.style.transform    = 'translateY(-1px)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.transform   = 'none'
              }}
            >
              {/* Move name + type badge */}
              <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                marginBottom:   '6px',
              }}>
                <span style={{
                  fontSize:   '14px',
                  fontWeight: 600,
                  color:      '#fff',
                  textTransform: 'capitalize',
                }}>
                  {move.name.replace(/-/g, ' ')}
                </span>
                <span style={{
                  fontSize:      '10px',
                  fontWeight:    600,
                  padding:       '2px 8px',
                  borderRadius:  '10px',
                  background:    tc.bg,
                  color:         tc.color,
                  textTransform: 'capitalize',
                  flexShrink:    0,
                  marginLeft:    '8px',
                }}>
                  {move.type}
                </span>
              </div>

              {/* PWR */}
              <p style={{
                fontSize: '11px',
                color:    'var(--text-muted)',
                margin:   0,
              }}>
                PWR {move.power || '—'}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MoveSelector