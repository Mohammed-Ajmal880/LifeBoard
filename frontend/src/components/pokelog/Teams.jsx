import { useState } from 'react'
import TeamMemberModal from './TeamMemberModal'
import api from '../../services/api'
import { TYPE_BORDER_COLOURS } from '../../constants/typeColours'
import ConfirmModal from '../common/ConfirmModal'


const EMPTY_SLOTS = [1, 2, 3, 4, 5, 6]

function Teams({ teams, onRefresh }) {
  const [memberModal, setMemberModal] = useState({ open: false, teamId: null, slot: null })
  const [newTeamName, setNewTeamName] = useState('')
  const [addingTeam, setAddingTeam] = useState(false)
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [sprites, setSprites] = useState({})
  const [confirmTeam, setConfirmTeam] = useState({ open: false, id: null })
  const [confirmMember, setConfirmMember] = useState({ open: false, teamId: null, slot: null })

  // Fetch sprite for a team member
  const fetchSprite = async (pokedexNumber) => {
    if (sprites[pokedexNumber]) return
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokedexNumber}`)
      const data = await res.json()
      setSprites(prev => ({
        ...prev,
        [pokedexNumber]: {
          sprite: data.sprites.front_default,
          name: data.name,
          type: data.types[0].type.name,
        }
      }))
    } catch (err) {
      console.error(err)
    }
  }

  // Fetch sprites for all members whenever teams change
  teams.forEach(team => {
    team.members?.forEach(m => {
      if (!sprites[m.pokedex_number]) fetchSprite(m.pokedex_number)
    })
  })

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return
    try {
      await api.post('/pokemon_team/', { team_name: newTeamName.trim() })
      setNewTeamName('')
      setAddingTeam(false)
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRename = async (teamId) => {
    if (!renameValue.trim()) return
    try {
      await api.patch(`/pokemon_team/${teamId}`, { team_name: renameValue.trim() })
      setRenamingId(null)
      setRenameValue('')
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteTeam = (teamId) => {
    setConfirmTeam({ open: true, id: teamId })
  }

  const confirmDeleteTeam = async () => {
    try {
      await api.delete(`/pokemon_team/${confirmTeam.id}`)
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddMember = async (payload) => {
    try {
      // 1. Look up the specific team we are updating
      const currentTeam = teams.find(t => t.id === memberModal.teamId)

      // 2. Check if a Pokémon is already occupying the target slot number
      const slotIsOccupied = currentTeam?.members?.some(m => m.slot === memberModal.slot)

      // 3. If someone is already there, clear them out of the database first
      if (slotIsOccupied) {
        await api.delete(`/pokemon_team/${memberModal.teamId}/members/${memberModal.slot}`)
      }

      // 4. Now that the slot is guaranteed empty, send the standard POST request
      await api.post(`/pokemon_team/${memberModal.teamId}/members`, payload)

      // 5. Clean up states and close the modal selection screen
      setMemberModal({ open: false, teamId: null, slot: null })
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save member')
    }
  }

  const handleRemoveMember = (teamId, slot) => {
    setConfirmMember({ open: true, teamId, slot })
  }

  const confirmRemoveMember = async () => {
    try {
      await api.delete(`/pokemon_team/${confirmMember.teamId}/members/${confirmMember.slot}`)
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleReplaceSlot = (teamId, slot) => {
    setMemberModal({ open: true, teamId, slot })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Teams</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Create named teams with up to 6 Pokémon slots each.</p>
        </div>
        <button className="btn-gradient" onClick={() => setAddingTeam(true)}>
          + New team
        </button>
      </div>

      {/* New team input */}
      {addingTeam && (
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '16px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--glass-border-purple)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
        }}>
          <input
            className="form-input"
            placeholder="Team name e.g. Pokémon Scarlet"
            value={newTeamName}
            onChange={e => setNewTeamName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateTeam()}
            autoFocus
            style={{ flex: 1 }}
          />
          <button className="btn-gradient" onClick={handleCreateTeam}>Create</button>
          <button className="btn-ghost" onClick={() => { setAddingTeam(false); setNewTeamName('') }}>Cancel</button>
        </div>
      )}

      {/* Empty state */}
      {teams.length === 0 && !addingTeam && (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          color: 'var(--text-muted)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius)',
        }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>⬟</p>
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>No teams yet</p>
          <p style={{ fontSize: '13px' }}>Click New team to build your first Pokémon team.</p>
        </div>
      )}

      {/* Team cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {teams.map(team => (
          <div key={team.id} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--glass-border-strong)',
            borderRadius: 'var(--radius)',
            padding: '18px',
            backdropFilter: 'blur(12px)',
          }}>
            {/* Team header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              {renamingId === team.id ? (
                <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '12px' }}>
                  <input
                    className="form-input"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRename(team.id)}
                    autoFocus
                    style={{ flex: 1 }}
                  />
                  <button className="btn-gradient" onClick={() => handleRename(team.id)}>Save</button>
                  <button className="btn-ghost" onClick={() => setRenamingId(null)}>Cancel</button>
                </div>
              ) : (
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{team.team_name}</h3>
              )}
              {renamingId !== team.id && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="action-btn"
                    onClick={() => { setRenamingId(team.id); setRenameValue(team.team_name) }}
                    title="Rename"
                  >✏</button>
                  <button
                    className="action-btn danger"
                    onClick={() => handleDeleteTeam(team.id)}
                    title="Delete team"
                  >🗑</button>
                </div>
              )}
            </div>

            {/* 6 slots grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '10px',
            }}>
              {EMPTY_SLOTS.map(slot => {
                const member = team.members?.find(m => m.slot === slot)
                const spriteData = member ? sprites[member.pokedex_number] : null
                const borderCol = spriteData ? (TYPE_BORDER_COLOURS[spriteData.type] || 'var(--glass-border)') : 'var(--glass-border)'

                return member ? (
                  // Filled slot
                  <div key={slot} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${borderCol}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 6px',
                    position: 'relative',
                    transition: 'border-color 0.2s',
                    boxShadow: `0 0 8px ${borderCol}40`,
                  }}>
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveMember(team.id, slot)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '10px',
                        cursor: 'pointer',
                        padding: '2px',
                        lineHeight: 1,
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      title="Remove"
                    >✕</button>

                    {/* Replace on click */}
                    <div
                      onClick={() => handleReplaceSlot(team.id, slot)}
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                      title="Click to replace"
                    >
                      {spriteData ? (
                        <img
                          src={spriteData.sprite}
                          alt={spriteData.name}
                          style={{
                            width: '56px',
                            height: '56px',
                            imageRendering: 'pixelated',
                          }}
                        />
                      ) : (
                        <div style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '20px' }}>⬟</span>
                        </div>
                      )}
                      {member.nickname && (
                        <p style={{ fontSize: '9px', color: 'var(--accent-purple)', fontWeight: 600, marginBottom: '1px', textAlign: 'center' }}>
                          {member.nickname}
                        </p>
                      )}
                      <p style={{
                        fontSize: '10px',
                        color: 'var(--text-secondary)',
                        textAlign: 'center',
                        textTransform: 'capitalize',
                        marginTop: '2px',
                      }}>
                        {spriteData?.name || '...'}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Empty slot
                  <div
                    key={slot}
                    onClick={() => setMemberModal({ open: true, teamId: team.id, slot })}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px dashed var(--glass-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '20px 6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      gap: '4px',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'
                      e.currentTarget.style.background = 'rgba(124,58,237,0.05)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--glass-border)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                    }}
                  >
                    <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>+</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Add</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Member modal */}
      <TeamMemberModal
        key={`${memberModal.teamId}-${memberModal.slot}`}
        open={memberModal.open}
        onClose={() => setMemberModal({ open: false, teamId: null, slot: null })}
        onSave={handleAddMember}
        slot={memberModal.slot}
      />
      <ConfirmModal
        open={confirmTeam.open}
        onClose={() => setConfirmTeam({ open: false, id: null })}
        onConfirm={confirmDeleteTeam}
        title="Delete team?"
        message="This team and all its Pokémon members will be permanently deleted."
      />

      <ConfirmModal
        open={confirmMember.open}
        onClose={() => setConfirmMember({ open: false, teamId: null, slot: null })}
        onConfirm={confirmRemoveMember}
        title="Remove Pokémon?"
        message="This Pokémon will be removed from the slot. You can add another one later."
      />
    </div>
  )
}

export default Teams