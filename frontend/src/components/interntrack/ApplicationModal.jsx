import { useState } from 'react'
import Portal from '../common/Portal'

function ApplicationModal({ open, onClose, onSave, application, cvVersions }) {

  // Initialize state directly from the prop. No useEffect needed!
  const [form, setForm] = useState({
    company: application?.company || '',
    role: application?.role || '',
    status: application?.status || 'applied',
    applied_date: application?.applied_date || '',
    cv_version_id: application?.cv_version_id || '',
    notes: application?.notes || '',
  })



  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      company: form.company,
      role: form.role,
      status: form.status,
      applied_date: form.applied_date,
      notes: form.notes || null,
      cv_version_id: form.cv_version_id || null,
    }
    onSave(payload)
  }

  return (
    <Portal>
      <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
              {application ? 'Update application' : 'Add application'}
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label className="form-label">Company</label>
                <input className="form-input" placeholder="e.g. Google" value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Role</label>
                <input className="form-input" placeholder="e.g. SWE Intern" value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="form-label">Date applied</label>
                <input className="form-input" type="date" value={form.applied_date}
                  onChange={e => setForm({ ...form, applied_date: e.target.value })} required />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label className="form-label">CV used</label>
              <select className="form-select" value={form.cv_version_id}
                onChange={e => setForm({ ...form, cv_version_id: e.target.value })}>
                <option value="">— None selected —</option>
                {cvVersions.map(cv => (
                  <option key={cv.id} value={cv.id}>{cv.label} ({cv.type})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" placeholder="Any notes about this application..."
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button type="submit" className="btn-gradient" style={{ flex: 1, justifyContent: 'center' }}>
                {application ? 'Update application' : 'Save application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  )
}

export default ApplicationModal