import Portal from '../../common/Portal'

function WhoGoesFirst({ open, onClose, team1Name, team2Name, onChoose }) {
  if (!open) return null

  return (
    <Portal>
      <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={{
          background:    'linear-gradient(160deg, rgba(20,15,50,0.98) 0%, rgba(10,10,30,0.98) 100%)',
          border:        '1px solid rgba(124,58,237,0.3)',
          borderRadius:  '16px',
          width:         '100%',
          maxWidth:      '860px',
          backdropFilter:'blur(24px)',
          boxShadow:     '0 40px 80px rgba(0,0,0,0.8)',
          overflow:      'hidden',
        }}>

          {/* Header */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '20px 28px',
            borderBottom:   '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>⚔</span>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: 0 }}>
                {team1Name} vs {team2Name}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                width:          '28px',
                height:         '28px',
                borderRadius:   '50%',
                background:     'rgba(255,255,255,0.08)',
                border:         '1px solid rgba(255,255,255,0.12)',
                color:          'var(--text-muted)',
                fontSize:       '14px',
                cursor:         'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
              }}
            >✕</button>
          </div>

          {/* Content */}
          <div style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        '80px 28px 100px',
            minHeight:      '320px',
          }}>
            <h3 style={{
              fontSize:     '26px',
              fontWeight:   700,
              color:        '#fff',
              marginBottom: '12px',
              textAlign:    'center',
            }}>
              Who would you like to go first?
            </h3>
            <p style={{
              fontSize:     '14px',
              color:        'var(--text-muted)',
              marginBottom: '40px',
              textAlign:    'center',
            }}>
              The chosen side will pick a move first each turn.
            </p>

            {/* Choice buttons */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => onChoose('team1')}
                style={{
                  padding:      '14px 32px',
                  borderRadius: '40px',
                  background:   'linear-gradient(135deg, #7c3aed, #5b7cf6)',
                  border:       'none',
                  color:        '#fff',
                  fontSize:     '15px',
                  fontWeight:   700,
                  cursor:       'pointer',
                  transition:   'opacity 0.2s, transform 0.15s',
                  boxShadow:    '0 0 20px rgba(124,58,237,0.4)',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none' }}
              >
                {team1Name} (You)
              </button>

              <button
                onClick={() => onChoose('team2')}
                style={{
                  padding:      '14px 32px',
                  borderRadius: '40px',
                  background:   'rgba(255,255,255,0.06)',
                  border:       '1px solid rgba(255,255,255,0.15)',
                  color:        '#fff',
                  fontSize:     '15px',
                  fontWeight:   700,
                  cursor:       'pointer',
                  transition:   'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none' }}
              >
                {team2Name}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}

export default WhoGoesFirst