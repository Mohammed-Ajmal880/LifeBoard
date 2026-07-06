import { useState } from 'react'

function SessionModal({ open, onClose, onSave, session }) {
  const [form, setForm] = useState({
    world_name:       session?.world_name || '',
    session_date:     session?.session_date || '',
    hours:            session ? Math.floor(session.duration_minutes / 60) : '',
    minutes:          session ? session.duration_minutes % 60 : '',
    description:      session?.description || '',
  })

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const duration_minutes =
      (parseInt(form.hours) || 0) * 60 + (parseInt(form.minutes) || 0)
    if (duration_minutes === 0) {
      alert('Please enter a valid duration.')
      return
    }
    onSave({
      world_name:       form.world_name,
      session_date:     form.session_date,
      duration_minutes,
      description:      form.description || null,
    })
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
            {session ? 'Update session' : 'Log session'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label className="form-label">World name</label>
              <input
                className="form-input"
                placeholder="e.g. SkyKingdom"
                value={form.world_name}
                onChange={e => setForm({ ...form, world_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Date</label>
              <input
                className="form-input"
                type="date"
                value={form.session_date}
                onChange={e => setForm({ ...form, session_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="form-label">Duration</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.hours}
                  onChange={e => setForm({ ...form, hours: e.target.value })}
                  style={{ paddingRight: '40px' }}
                />
                <span style={{
                  position:   'absolute',
                  right:      '12px',
                  top:        '50%',
                  transform:  'translateY(-50%)',
                  fontSize:   '12px',
                  color:      'var(--text-muted)',
                }}>hrs</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  value={form.minutes}
                  onChange={e => setForm({ ...form, minutes: e.target.value })}
                  style={{ paddingRight: '40px' }}
                />
                <span style={{
                  position:   'absolute',
                  right:      '12px',
                  top:        '50%',
                  transform:  'translateY(-50%)',
                  fontSize:   '12px',
                  color:      'var(--text-muted)',
                }}>min</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Notes (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="What did you build or achieve?"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-ghost"
              style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn-gradient"
              style={{ flex: 1, justifyContent: 'center' }}>
              {session ? 'Update session' : 'Log session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SessionModal