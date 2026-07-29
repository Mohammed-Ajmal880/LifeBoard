import { TYPE_BORDER_COLOURS, TYPE_BADGE_COLOURS } from '../../../constants/typeColours'
import Portal from '../../common/Portal'

function PokemonSelectModal({ open, team, sprites, reason, onSelect }) {
  if (!open) return null

  const alivePokemon  = team.filter(p => !p.fainted)
  const faintedPokemon = team.filter(p => p.fainted)

  return (
    <Portal>
      <div style={{
        position:        'fixed',
        inset:           0,
        background:      'rgba(5,5,20,0.85)',
        backdropFilter:  'blur(8px)',
        zIndex:          9999,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '24px',
      }}>
        <div style={{
          background:    'linear-gradient(160deg, rgba(20,15,50,0.99) 0%, rgba(8,8,28,0.99) 100%)',
          border:        '1px solid rgba(124,58,237,0.35)',
          borderRadius:  '16px',
          padding:       '28px',
          width:         '100%',
          maxWidth:      '520px',
          backdropFilter:'blur(24px)',
          boxShadow:     '0 40px 80px rgba(0,0,0,0.9)',
        }}>

          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              {reason === 'lead' ? 'Choose your lead Pokémon' : 'Choose your next Pokémon'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {reason === 'lead'
                ? 'Select which Pokémon will battle first.'
                : 'Your Pokémon fainted — send out your next one.'}
            </p>
          </div>

          {/* Alive Pokémon grid */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap:                 '10px',
            marginBottom:        faintedPokemon.length > 0 ? '16px' : '0',
          }}>
            {alivePokemon.map((pokemon, i) => {
              const spriteData = sprites?.[pokemon.name] || null
              const borderCol  = spriteData
                ? (TYPE_BORDER_COLOURS[spriteData.type] || 'var(--glass-border)')
                : 'var(--glass-border-purple)'
              const tc = spriteData
                ? (TYPE_BADGE_COLOURS[spriteData.type] || { bg: 'rgba(255,255,255,0.1)', color: '#fff' })
                : { bg: 'rgba(124,58,237,0.2)', color: '#a78bfa' }

              return (
                <button
                  key={i}
                  onClick={() => onSelect(pokemon)}
                  style={{
                    background:   'rgba(255,255,255,0.04)',
                    border:       `1px solid ${borderCol}`,
                    borderRadius: '12px',
                    padding:      '14px 10px',
                    cursor:       'pointer',
                    display:      'flex',
                    flexDirection:'column',
                    alignItems:   'center',
                    gap:          '8px',
                    transition:   'all 0.2s',
                    boxShadow:    `0 0 8px ${borderCol}30`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background  = 'rgba(124,58,237,0.15)'
                    e.currentTarget.style.transform   = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow   = `0 0 16px ${borderCol}60`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background  = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.transform   = 'none'
                    e.currentTarget.style.boxShadow   = `0 0 8px ${borderCol}30`
                  }}
                >
                  {/* Sprite */}
                  {pokemon.sprite ? (
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      style={{
                        width:          '72px',
                        height:         '72px',
                        imageRendering: 'pixelated',
                        filter:         `drop-shadow(0 0 6px ${borderCol}80)`,
                      }}
                    />
                  ) : (
                    <div style={{
                      width:          '72px',
                      height:         '72px',
                      background:     'rgba(255,255,255,0.04)',
                      borderRadius:   '8px',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      fontSize:       '24px',
                    }}>⬟</div>
                  )}

                  {/* Name */}
                  <p style={{
                    fontSize:      '13px',
                    fontWeight:    600,
                    color:         '#fff',
                    textTransform: 'capitalize',
                    textAlign:     'center',
                  }}>
                    {pokemon.name}
                  </p>

                  {/* Type badge */}
                  <span style={{
                    fontSize:      '10px',
                    fontWeight:    600,
                    padding:       '2px 8px',
                    borderRadius:  '10px',
                    background:    tc.bg,
                    color:         tc.color,
                    textTransform: 'capitalize',
                  }}>
                    {spriteData?.type || pokemon.type || '—'}
                  </span>

                  {/* HP bar */}
                  <div style={{ width: '100%' }}>
                    <div style={{
                      height:       '4px',
                      background:   'rgba(255,255,255,0.1)',
                      borderRadius: '2px',
                      overflow:     'hidden',
                    }}>
                      <div style={{
                        height:     '100%',
                        width:      `${Math.round((pokemon.current_hp / pokemon.max_hp) * 100)}%`,
                        background: pokemon.current_hp / pokemon.max_hp > 0.5
                          ? '#4ade80'
                          : pokemon.current_hp / pokemon.max_hp > 0.2
                          ? '#facc15'
                          : '#f87171',
                        borderRadius:'2px',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <p style={{
                      fontSize:  '10px',
                      color:     'var(--text-muted)',
                      textAlign: 'right',
                      marginTop: '2px',
                    }}>
                      {pokemon.current_hp}/{pokemon.max_hp} HP
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Fainted Pokémon — greyed out, shown for context */}
          {faintedPokemon.length > 0 && (
            <div>
              <p style={{
                fontSize:      '10px',
                fontWeight:    600,
                color:         'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom:  '8px',
              }}>
                Fainted
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {faintedPokemon.map((pokemon, i) => (
                  <div key={i} style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '6px',
                    padding:      '5px 12px 5px 6px',
                    borderRadius: '20px',
                    background:   'rgba(255,255,255,0.03)',
                    border:       '1px solid rgba(255,255,255,0.06)',
                    opacity:      0.4,
                  }}>
                    {pokemon.sprite && (
                      <img
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        style={{
                          width:          '24px',
                          height:         '24px',
                          imageRendering: 'pixelated',
                          filter:         'grayscale(1)',
                        }}
                      />
                    )}
                    <span style={{
                      fontSize:      '12px',
                      color:         'var(--text-muted)',
                      textTransform: 'capitalize',
                    }}>
                      {pokemon.name}
                    </span>
                    <span style={{ fontSize: '11px', color: '#f87171' }}>✕</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Portal>
  )
}

export default PokemonSelectModal