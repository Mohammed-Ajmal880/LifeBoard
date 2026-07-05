import { useState } from 'react'
import { POKEMON_SEASONS } from '../../constants/seasons'
import WatchLogModal from './WatchLogModal'
import api from '../../services/api'

function WatchLog({ entries, onRefresh }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  const handleSave = async (payload) => {
    try {
      if (editingEntry) {
        await api.patch(`/watchlog/${editingEntry.id}`, payload)
      } else {
        await api.post('/watchlog/', payload)
      }
      setModalOpen(false)
      setEditingEntry(null)
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save episode')
    }
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this episode entry?')) return
    try {
      await api.delete(`/watchlog/${id}`)
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  // Group entries by season
  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.season]) acc[entry.season] = []
    acc[entry.season].push(entry)
    return acc
  }, {})

  // Get total episodes for a season from constants
  const getTotal = (seasonName) => {
    const found = POKEMON_SEASONS.find(s => s.name === seasonName)
    return found ? found.episodes : null
  }

  // Get last watched episode number
  const getLastWatched = (seasonEntries) => {
    const watched = seasonEntries
      .filter(e => e.watched)
      .sort((a, b) => b.episode_number - a.episode_number)
    return watched.length > 0 ? watched[0].episode_number : null
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Watch log</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Track Pokémon anime episodes season by season.</p>
        </div>
        <button
          className="btn-gradient"
          onClick={() => { setEditingEntry(null); setModalOpen(true) }}
        >
          + Log episode
        </button>
      </div>

      {/* Empty state */}
      {Object.keys(grouped).length === 0 && (
        <div style={{
          textAlign:    'center',
          padding:      '60px 24px',
          color:        'var(--text-muted)',
          background:   'rgba(255,255,255,0.02)',
          border:       '1px solid var(--glass-border)',
          borderRadius: 'var(--radius)',
        }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>📺</p>
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>No episodes logged yet</p>
          <p style={{ fontSize: '13px' }}>Click Log episode to start tracking your watch progress.</p>
        </div>
      )}

      {/* Season grid */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap:                 '16px',
      }}>
        {Object.entries(grouped).map(([seasonName, seasonEntries]) => {
          const total       = getTotal(seasonName)
          const watchedCount = seasonEntries.filter(e => e.watched).length
          const percent     = total ? Math.round((watchedCount / total) * 100) : null
          const lastWatched = getLastWatched(seasonEntries)
          const sorted      = [...seasonEntries].sort((a, b) => b.episode_number - a.episode_number)

          return (
            <div key={seasonName} style={{
              background:    'rgba(255,255,255,0.04)',
              border:        '1px solid var(--glass-border-strong)',
              borderRadius:  'var(--radius)',
              padding:       '16px',
              backdropFilter:'blur(12px)',
            }}>
              {/* Season header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{seasonName}</h3>
                {percent !== null && (
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-purple)' }}>
                    {percent}%
                  </span>
                )}
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {watchedCount}{total ? ` / ${total}` : ''} watched
                {lastWatched && ` · Last: EP ${lastWatched}`}
              </p>

              {/* Progress bar */}
              {percent !== null && (
                <div style={{
                  height:       '4px',
                  background:   'rgba(255,255,255,0.08)',
                  borderRadius: '2px',
                  marginBottom: '14px',
                  overflow:     'hidden',
                }}>
                  <div style={{
                    height:     '100%',
                    width:      `${percent}%`,
                    background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-blue))',
                    borderRadius:'2px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              )}

              {/* Episode rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sorted.map(entry => (
                  <div key={entry.id} style={{
                    display:       'flex',
                    alignItems:    'center',
                    gap:           '10px',
                    background:    'rgba(255,255,255,0.03)',
                    border:        '1px solid var(--glass-border)',
                    borderRadius:  'var(--radius-sm)',
                    padding:       '9px 12px',
                    transition:    'border-color 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                  >
                    {/* EP badge */}
                    <div style={{
                      fontSize:       '10px',
                      fontWeight:     700,
                      color:          '#fff',
                      background:     'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                      borderRadius:   '6px',
                      padding:        '3px 7px',
                      flexShrink:     0,
                      fontFamily:     'JetBrains Mono, monospace',
                    }}>
                      EP {entry.episode_number}
                    </div>

                    {/* Title + date */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize:     '12px',
                        fontWeight:   500,
                        color:        entry.watched ? 'var(--text-primary)' : 'var(--text-muted)',
                        whiteSpace:   'nowrap',
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {entry.episode_title || '—'}
                      </p>
                      {entry.watched_date && (
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                          Watched {entry.watched_date}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button
                        className="action-btn"
                        onClick={() => handleEdit(entry)}
                        title="Edit"
                      >✏</button>
                      <button
                        className="action-btn danger"
                        onClick={() => handleDelete(entry.id)}
                        title="Delete"
                      >🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <WatchLogModal
        key={editingEntry?.id || 'new'}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEntry(null) }}
        onSave={handleSave}
        entry={editingEntry}
      />
    </div>
  )
}

export default WatchLog