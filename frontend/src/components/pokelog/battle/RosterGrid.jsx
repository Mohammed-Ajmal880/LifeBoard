import { TYPE_BORDER_COLOURS } from '../../../constants/typeColours'

function RosterGrid({ team, label, sprites }) {
  return (
    <div style={{
      background:   'rgba(0,0,0,0.3)',
      border:       '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding:      '16px',
      marginTop:    '10px',
    }}>
      <p style={{
        fontSize:      '10px',
        fontWeight:    600,
        color:         'var(--text-muted)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom:  '8px',
      }}>
        {label}
      </p>
      <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
        {team?.team_name || '—'}
      </p>
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap:                 '8px',
      }}>
        {[1,2,3,4,5,6].map(slot => {
          const member = team?.members?.find(m => m.slot === slot)
          const spriteData = member ? sprites[member.pokedex_number] : null
          const border = spriteData ? TYPE_BORDER_COLOURS[spriteData.type] : 'rgba(255,255,255,0.1)'

          return (
            <div key={slot} style={{
              aspectRatio:    '1',
              background:     'rgba(0,0,0,0.4)',
              border:         member ? `1px solid ${border}` : '1px dashed rgba(255,255,255,0.1)',
              borderRadius:   '10px',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              boxShadow:      spriteData ? `0 0 8px ${border}40` : 'none',
            }}>
              {spriteData ? (
                <img
                  src={spriteData.sprite}
                  alt={spriteData.name}
                  style={{ width: '72px', height: '72px', imageRendering: 'pixelated' }}
                />
              ) : (
                <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.1)' }}>—</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RosterGrid