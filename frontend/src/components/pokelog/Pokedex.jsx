import { useState, useEffect } from 'react'
import { TYPE_BADGE_COLOURS, TYPE_BORDER_COLOURS } from '../../constants/typeColours'

function Pokedex() {
  const [allPokemon, setAllPokemon] = useState([])
  const [query, setQuery]           = useState('')
  const [details, setDetails]       = useState({})
  
  // 1 & 3. ❌ REMOVED loadingDetails entirely.
  // 2. ❌ REMOVED filtered state entirely.
  
  // ✅ Derived loading state (just like the modal)
  const loadingList = allPokemon.length === 0

  // Fetch master list once on mount
  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
      .then(r => r.json())
      .then(data => {
        setAllPokemon(data.results)
      })
  }, [])

  // ✅ 2. Derived filtered state! Calculates instantly without a useEffect.
  const filtered = query
    ? allPokemon.filter(p => p.name.includes(query.toLowerCase())).slice(0, 20)
    : allPokemon.slice(0, 20)

  // Fetch details for visible Pokémon
  useEffect(() => {
    // We only loop through the 20 visible pokemon
    filtered.forEach(p => {
      // If we haven't fetched this specific pokemon's details yet, fetch it
      if (!details[p.name]) {
        fetch(p.url || `https://pokeapi.co/api/v2/pokemon/${p.name}`)
          .then(r => r.json())
          .then(data => {
            setDetails(prev => ({ ...prev, [p.name]: data }))
          })
      }
    })
  }, [filtered, details])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Pokédex</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Browse and search all 1025 Pokémon — nothing saved from here.
        </p>
      </div>

      {/* Search bar */}
      <input
        className="form-input"
        placeholder="Search the Pokédex..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginBottom: '16px', maxWidth: '360px' }}
      />

      {/* Loading state */}
      {loadingList && (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading Pokédex...</p>
      )}

      {/* Grid */}
      {!loadingList && (
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap:                 '12px',
        }}>
          {filtered.map((p) => {
            const d           = details[p.name]
            const num         = p.url.split('/').filter(Boolean).pop()
            const primaryType = d?.types?.[0]?.type?.name
            const borderCol   = primaryType ? TYPE_BORDER_COLOURS[primaryType] : 'var(--glass-border)'

            return (
              <div key={p.name} style={{
                background:    'rgba(255,255,255,0.04)',
                border:        `1px solid ${d ? borderCol + '60' : 'var(--glass-border)'}`,
                borderRadius:  'var(--radius)',
                padding:       '14px',
                backdropFilter:'blur(10px)',
                transition:    'border-color 0.3s, transform 0.2s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = borderCol
                  e.currentTarget.style.transform   = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = d ? borderCol + '60' : 'var(--glass-border)'
                  e.currentTarget.style.transform   = 'translateY(0)'
                }}
              >
                {/* Number + types row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize:   '11px',
                    color:      'var(--text-muted)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    #{String(num).padStart(4, '0')}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {d?.types?.map(t => {
                      const tc = TYPE_BADGE_COLOURS[t.type.name] || { bg: 'rgba(255,255,255,0.1)', color: '#fff' }
                      return (
                        <span key={t.type.name} style={{
                          fontSize:      '10px',
                          fontWeight:    600,
                          padding:       '2px 7px',
                          borderRadius:  '10px',
                          background:    tc.bg,
                          color:         tc.color,
                          textTransform: 'capitalize',
                        }}>
                          {t.type.name}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Sprite + info row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {d?.sprites?.front_default ? (
                    <img
                      src={d.sprites.front_default}
                      alt={d.name}
                      style={{
                        width:          '64px',
                        height:         '64px',
                        imageRendering: 'pixelated',
                        filter:         `drop-shadow(0 0 6px ${borderCol}60)`,
                        flexShrink:     0,
                      }}
                    />
                  ) : (
                    <div style={{
                      width:          '64px',
                      height:         '64px',
                      background:     'rgba(255,255,255,0.04)',
                      borderRadius:   '8px',
                      flexShrink:     0,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      fontSize:       '20px',
                    }}>
                      ⬟
                    </div>
                  )}

                  <div>
                    <p style={{
                      fontSize:      '15px',
                      fontWeight:    700,
                      color:         '#fff',
                      textTransform: 'capitalize',
                      marginBottom:  '4px',
                    }}>
                      {p.name}
                    </p>
                    {d ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        HP {d.stats[0].base_stat} &nbsp; ATK {d.stats[1].base_stat}
                      </p>
                    ) : (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading...</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* No results */}
      {!loadingList && filtered.length === 0 && (
        <div style={{
          textAlign:    'center',
          padding:      '48px',
          color:        'var(--text-muted)',
          fontSize:     '13px',
        }}>
          No Pokémon found for &quot;{query}&quot;
        </div>
      )}
    </div>
  )
}

export default Pokedex