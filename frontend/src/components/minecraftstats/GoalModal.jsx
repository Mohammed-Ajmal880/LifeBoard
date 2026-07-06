import { useState } from 'react'

function GoalModal({ open, onClose, onSave, goal }) {
  const [title, setTitle] = useState(goal?.title || '')

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim() })
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
            {goal ? 'Update goal' : 'Add goal'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Goal title</label>
            <input
              className="form-input"
              placeholder="e.g. Finish the Nether expedition"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-ghost"
              style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn-gradient"
              style={{ flex: 1, justifyContent: 'center' }}>
              {goal ? 'Update goal' : 'Add goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GoalModal