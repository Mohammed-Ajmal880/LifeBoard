import { useState } from 'react'

function CVModal({ open, onClose, onSave, cv }) {
  // Initialize state directly from the cv prop. No useEffect!
  const [form, setForm] = useState({ 
    label: cv?.label || '', 
    type: cv?.type || '' 
  })
  const [file, setFile] = useState(null)

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('label', form.label)
    formData.append('type', form.type)
    if (file) formData.append('file', file)
    onSave(formData)
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
            {cv ? 'Update CV' : 'Upload CV'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label className="form-label">Label</label>
            <input
              className="form-input"
              placeholder="e.g. SE General"
              value={form.label}
              onChange={e => setForm({ ...form, label: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="form-label">Type</label>
            <input
              className="form-input"
              placeholder="e.g. QA, SE, AI"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">
              File {cv && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave empty to keep current)</span>}
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={e => setFile(e.target.files[0])}
              required={!cv}
              style={{
                width:        '100%',
                background:   'var(--input-bg)',
                border:       '1px solid var(--input-border)',
                borderRadius: 'var(--radius-sm)',
                padding:      '10px 14px',
                fontSize:     '13px',
                color:        'var(--text-primary)',
                cursor:       'pointer',
              }}
            />
            {file && (
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Selected: {file.name}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-ghost"
              style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn-gradient"
              style={{ flex: 1, justifyContent: 'center' }}>
              {cv ? 'Update CV' : 'Upload CV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CVModal