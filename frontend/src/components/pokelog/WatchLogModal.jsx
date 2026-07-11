import { useState } from 'react'
import { POKEMON_SEASONS } from '../../constants/seasons'
import Portal from '../common/Portal'

function WatchLogModal({ open, onClose, onSave, entry }) {
  const [form, setForm] = useState({
    season: entry?.season || '',
    episode_number: entry?.episode_number || '',
    episode_title: entry?.episode_title || '',
    watched: entry?.watched ?? true,
    watched_date: entry?.watched_date || '',
  })

  const [episodesList, setEpisodesList] = useState([])

  if (!open) return null

  // ==========================================
  // 1. DERIVED VARIABLES (Calculated instantly on render)
  // ==========================================
  const selectedSeasonData = POKEMON_SEASONS.find(s => s.name === form.season)
  const eNum = parseInt(form.episode_number)
  
  let currentError = ''
  let displayTitle = form.episode_title // Fallback to database value when editing

  if (selectedSeasonData && eNum > selectedSeasonData.episodes) {
    currentError = `Season only has ${selectedSeasonData.episodes} episodes.`
    displayTitle = ''
  } 
  else if (selectedSeasonData && eNum && episodesList.length > 0) {
    // TMDB handles seasons cleanly, so we just look inside our custom pre-filtered list
    const targetEpisode = episodesList.find(ep => ep.episode_number === eNum)
    if (targetEpisode) {
      displayTitle = targetEpisode.name
    } else {
      displayTitle = ''
    }
  } else if (!form.episode_number) {
    displayTitle = ''
  }

  // ==========================================
  // 2. EVENT HANDLERS
  // ==========================================
  const handleSeasonChange = async (e) => {
    const newSeason = e.target.value
    
    setForm({ ...form, season: newSeason, episode_number: '', episode_title: '' })
    setEpisodesList([]) 

    const seasonData = POKEMON_SEASONS.find(s => s.name === newSeason)
    if (!seasonData) return

    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${seasonData.tmdbShowId}/season/${seasonData.tmdbSeason}?api_key=${API_KEY}&language=en-US`
      )
      const data = await response.json()
      
      if (data.episodes) {
        setEpisodesList(data.episodes)
      }
    } catch (err) {
      console.error("Failed to fetch episodes from TMDB:", err)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (currentError) return 

    onSave({
      season: form.season,
      episode_number: eNum,
      episode_title: displayTitle || null,
      watched: form.watched,
      watched_date: form.watched_date || null,
    })
  }

  return (
    <Portal>
      <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
              {entry ? 'Edit episode' : 'Log episode'}
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label className="form-label">Season</label>
              <select
                className="form-select"
                value={form.season}
                onChange={handleSeasonChange}
                required
              >
                <option value="">— Select a season —</option>
                {POKEMON_SEASONS.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label className="form-label">Episode number</label>
                <input
                  className="form-input"
                  style={{ borderColor: currentError ? '#ef4444' : undefined }}
                  type="number"
                  min="1"
                  placeholder="e.g. 47"
                  value={form.episode_number}
                  onChange={e => setForm({ ...form, episode_number: e.target.value })}
                  required
                />
                {currentError && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{currentError}</span>}
              </div>
              <div>
                <label className="form-label">Watched date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.watched_date}
                  onChange={e => setForm({ ...form, watched_date: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label className="form-label">Episode title (Auto-filled)</label>
              <input
                className="form-input"
                placeholder="Select season and episode number..."
                value={displayTitle}
                readOnly
                style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed', color: 'var(--text-secondary)' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={form.watched}
                  onChange={e => setForm({ ...form, watched: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-purple)' }}
                />
                Mark as watched
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-gradient"
                disabled={!!currentError}
                style={{ flex: 1, justifyContent: 'center', opacity: currentError ? 0.5 : 1, cursor: currentError ? 'not-allowed' : 'pointer' }}
              >
                {entry ? 'Update episode' : 'Log episode'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  )
}

export default WatchLogModal