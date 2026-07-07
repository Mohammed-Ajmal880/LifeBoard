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

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      season: form.season,
      episode_number: parseInt(form.episode_number),
      episode_title: form.episode_title || null,
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
                onChange={e => setForm({ ...form, season: e.target.value })}
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
                  type="number"
                  min="1"
                  placeholder="e.g. 47"
                  value={form.episode_number}
                  onChange={e => setForm({ ...form, episode_number: e.target.value })}
                  required
                />
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
              <label className="form-label">Episode title (optional)</label>
              <input
                className="form-input"
                placeholder="e.g. The captain rises"
                value={form.episode_title}
                onChange={e => setForm({ ...form, episode_title: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}>
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
              <button type="button" onClick={onClose} className="btn-ghost"
                style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button type="submit" className="btn-gradient"
                style={{ flex: 1, justifyContent: 'center' }}>
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