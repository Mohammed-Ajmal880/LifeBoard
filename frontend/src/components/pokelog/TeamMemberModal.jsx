import { useState, useEffect } from 'react'
import { TYPE_BORDER_COLOURS, TYPE_BADGE_COLOURS } from '../../constants/typeColours'

function TeamMemberModal({ open, onClose, onSave, slot }) {
  const [query, setQuery]           = useState('')
  const [allPokemon, setAllPokemon] = useState([])
  const [selected, setSelected]     = useState(null)
  const [details, setDetails]       = useState(null)
  const [nickname, setNickname]     = useState('')
  
  // 1. ❌ REMOVE the useState for loadingList
  const [loadingDetails, setLoadingDetails] = useState(false)

  // 2. ✅ ADD this derived variable: It is true if the array is empty!
  const loadingList = allPokemon.length === 0;

  useEffect(() => {
    if (!open) return
    
    // 3. ❌ REMOVE setLoadingList(true) and .finally()
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
      .then(r => r.json())
      .then(data => {
        setAllPokemon(data.results) 
        // Once this sets the 1025 pokemon, `loadingList` automatically becomes false!
      })
  }, [open])

  const filtered = query
    ? allPokemon.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 20)
    : allPokemon.slice(0, 20)

  // Fetch full details when a Pokémon is selected
  const handleSelect = async (pokemon) => {
    setSelected(pokemon)
    setLoadingDetails(true)
    try {
      const res  = await fetch(pokemon.url)
      const data = await res.json()
      setDetails(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleConfirm = () => {
    if (!selected || !details) return
    onSave({
      pokedex_number: details.id,
      slot,
      nickname: nickname || null,
    })
  }

  if (!open) return null

  const primaryType = details?.types?.[0]?.type?.name
  const borderColour = primaryType ? TYPE_BORDER_COLOURS[primaryType] : 'var(--glass-border)'

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
            Add Pokémon — Slot {slot}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Search bar */}
        <input
          className="form-input"
          placeholder="Search Pokémon by name..."
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(null); setDetails(null) }}
          style={{ marginBottom: '12px' }}
          autoFocus
        />

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>

          {/* Left — search results */}
          <div style={{
            background:   'rgba(255,255,255,0.03)',
            border:       '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            height:       '240px',
            overflowY:    'auto',
          }}>
            {loadingList ? (
              <p style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>Loading...</p>
            ) : filtered.map((p, i) => {
              const num   = p.url.split('/').filter(Boolean).pop()
              const isSelected = selected?.name === p.name
              return (
                <div
                  key={i}
                  onClick={() => handleSelect(p)}
                  style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        '8px',
                    padding:    '8px 12px',
                    cursor:     'pointer',
                    background: isSelected ? 'var(--accent-purple-dim)' : 'transparent',
                    borderLeft: isSelected ? '2px solid var(--accent-purple)' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                    #{String(num).padStart(4, '0')}
                  </span>
                  <span style={{ fontSize: '13px', color: isSelected ? '#fff' : 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    {p.name}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Right — preview */}
          <div style={{
            background:     'rgba(255,255,255,0.03)',
            border:         `1px solid ${borderColour}`,
            borderRadius:   'var(--radius-sm)',
            height:         '240px',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        '16px',
            transition:     'border-color 0.3s',
          }}>
            {loadingDetails ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading...</p>
            ) : details ? (
              <>
                <img
                  src={details.sprites.front_default}
                  alt={details.name}
                  style={{
                    width:       '96px',
                    height:      '96px',
                    imageRendering: 'pixelated',
                    filter:      'drop-shadow(0 0 8px rgba(124,58,237,0.4))',
                  }}
                />
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', textTransform: 'capitalize', marginBottom: '6px' }}>
                  {details.name}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  #{String(details.id).padStart(4, '0')}
                </p>
                {/* Type badges */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {details.types.map(t => {
                    const tc = TYPE_BADGE_COLOURS[t.type.name] || { bg: 'rgba(255,255,255,0.1)', color: '#fff' }
                    return (
                      <span key={t.type.name} style={{
                        fontSize:     '10px',
                        fontWeight:   600,
                        padding:      '2px 8px',
                        borderRadius: '10px',
                        background:   tc.bg,
                        color:        tc.color,
                        textTransform:'capitalize',
                      }}>
                        {t.type.name}
                      </span>
                    )
                  })}
                </div>
                {/* Stats */}
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>HP {details.stats[0].base_stat}</span>
                  <span>ATK {details.stats[1].base_stat}</span>
                </div>
              </>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Search and select a Pokémon to preview it here
              </p>
            )}
          </div>
        </div>

        {/* Nickname input */}
        {details && (
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Nickname (optional)</label>
            <input
              className="form-input"
              placeholder={`e.g. My ${details.name}`}
              value={nickname}
              onChange={e => setNickname(e.target.value)}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={onClose} className="btn-ghost"
            style={{ flex: 1, justifyContent: 'center' }}>
            Cancel
          </button>
          <button
            className="btn-gradient"
            style={{ flex: 1, justifyContent: 'center', opacity: details ? 1 : 0.5 }}
            disabled={!details}
            onClick={handleConfirm}
          >
            Add to slot {slot}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TeamMemberModal