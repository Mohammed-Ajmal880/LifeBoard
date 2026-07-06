import SessionModal from './SessionModal'
import { useState } from 'react'
import api from '../../services/api'

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function SessionsTable({ sessions, onRefresh }) {
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editingSession, setEditingSession] = useState(null)

  const handleSave = async (payload) => {
    try {
      if (editingSession) {
        await api.patch(`/sessions/${editingSession.id}`, payload)
      } else {
        await api.post('/sessions/', payload)
      }
      setModalOpen(false)
      setEditingSession(null)
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (session) => {
    setEditingSession(session)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return
    try {
      await api.delete(`/sessions/${id}`)
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    /* ✅ GLASSMORPHIC CARD WRAPPER */
    <div className="glass-card" style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid var(--glass-border-strong, rgba(255, 255, 255, 0.08))',
      borderRadius: '16px',
      padding: '20px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      
      {/* ✅ CORNER ALIGNED HEADER INSIDE THE CARD */}
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        marginBottom:   '16px',
      }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff' }}>
          Recent sessions
        </h3>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {sessions.length} {sessions.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* ✅ ORIGINAL UNTOUCHED TABLE LOGIC */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>World</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{
                  textAlign: 'center',
                  padding:   '40px',
                  color:     'var(--text-muted)',
                }}>
                  No sessions logged yet — click Log session to start!
                </td>
              </tr>
            ) : (
              sessions.map(session => (
                <tr key={session.id}>
                  <td className="td-primary">{session.world_name}</td>
                  <td className="td-mono">{session.session_date}</td>
                  <td className="td-mono">{formatDuration(session.duration_minutes)}</td>
                  <td style={{
                    maxWidth:     '200px',
                    overflow:     'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace:   'nowrap',
                    color:        'var(--text-muted)',
                    fontSize:     '12px',
                  }}>
                    {session.description || '—'}
                  </td>
                  <td>
                    <div className="td-actions">
                      <button
                        className="action-btn"
                        onClick={() => handleEdit(session)}
                      >
                        ✏ Update
                      </button>
                      <button
                        className="action-btn danger"
                        onClick={() => handleDelete(session.id)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SessionModal
        key={editingSession?.id || 'new'}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSession(null) }}
        onSave={handleSave}
        session={editingSession}
      />
    </div>
  )
}

export default SessionsTable