import { useState, useEffect, useMemo } from 'react'
import Portal from '../../common/Portal'
import RosterGrid from './RosterGrid'

function BattleSetup({ open, onClose, teams, onStartBattle }) {
  const [team1Id,   setTeam1Id]   = useState('')
  const [team2Id,   setTeam2Id]   = useState('')
  const [sprites,   setSprites]   = useState({})

  const eligibleTeams = useMemo(
    () => teams.filter(t => (t.members?.length || 0) >= 3),
    [teams]
  )

  const team1 = eligibleTeams.find(t => t.id === team1Id)
  const team2 = eligibleTeams.find(t => t.id === team2Id)

  // Fetch sprites for all eligible team members
  useEffect(() => {
    if (!open) return

    const allMembers = eligibleTeams.flatMap(t => t.members || [])
    allMembers.forEach(m => {
      if (sprites[m.pokedex_number]) return

      fetch(`https://pokeapi.co/api/v2/pokemon/${m.pokedex_number}`)
        .then(r => r.json())
        .then(data => {
          setSprites(prev => ({
            ...prev,
            [m.pokedex_number]: {
              sprite: data.sprites.front_default,
              type:   data.types[0].type.name,
              name:   data.name,
            }
          }))
        })
    })
  }, [open, eligibleTeams, sprites])

  if (!open) return null

  const canStart = team1Id && team2Id && team1Id !== team2Id

  return (
    <Portal>
      <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={{
          background:    'rgba(15,12,30,0.97)',
          border:        '1px solid rgba(124,58,237,0.3)',
          borderRadius:  '16px',
          padding:       '28px',
          width:         '100%',
          maxWidth:      '860px',
          backdropFilter:'blur(24px)',
          boxShadow:     '0 40px 80px rgba(0,0,0,0.8)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Battle setup</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer' }}>✕</button>
          </div>

          {/* Two column team pickers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
            {/* Your team */}
            <div>
              <label className="form-label">Your team</label>
              <select
                className="form-select"
                value={team1Id}
                onChange={e => setTeam1Id(e.target.value)}
              >
                <option value="">— Select your team —</option>
                {eligibleTeams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.team_name} ({t.members?.length || 0})
                  </option>
                ))}
              </select>
              <RosterGrid team={team1} label="Your roster" sprites={sprites} />
            </div>

            {/* Opponent team */}
            <div>
              <label className="form-label">Opponent&apos;s team</label>
              <select
                className="form-select"
                value={team2Id}
                onChange={e => setTeam2Id(e.target.value)}
              >
                <option value="">— Select opponent team —</option>
                {eligibleTeams
                  .filter(t => t.id !== team1Id)
                  .map(t => (
                    <option key={t.id} value={t.id}>
                      {t.team_name} ({t.members?.length || 0})
                    </option>
                  ))}
              </select>
              <RosterGrid team={team2} label="Opponent roster" sprites={sprites} />
            </div>
          </div>

          {/* Start battle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn-gradient"
              disabled={!canStart}
              onClick={() => onStartBattle(team1Id, team2Id)}
              style={{
                opacity: canStart ? 1 : 0.4,
                cursor:  canStart ? 'pointer' : 'not-allowed',
                padding: '10px 24px',
                fontSize:'14px',
              }}
            >
              ⚔ Start Battle
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}

export default BattleSetup