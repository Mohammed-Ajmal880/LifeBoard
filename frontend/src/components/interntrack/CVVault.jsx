import { useState } from 'react'
import CVModal from './CVModal'
import api from '../../services/api'
import ConfirmModal from '../common/ConfirmModal'

function CVVault({ cvVersions, onRefresh }) {
  const [modalOpen, setModalOpen]   = useState(false)
  const [editingCV, setEditingCV]   = useState(null)
  const [confirmOpen, setConfirmOpen]   = useState(false)
  const [deletingId,  setDeletingId]    = useState(null)

  const handleSave = async (formData) => {
    try {
      if (editingCV) {
        await api.patch(`/cvs/${editingCV.id}`, formData)
      } else {
        await api.post('/cvs/upload', formData)
      }
      setModalOpen(false)
      setEditingCV(null)
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = (id) => {
  setDeletingId(id)
  setConfirmOpen(true)
}

const confirmDelete = async () => {
  try {
    await api.delete(`/cvs/${deletingId}`)
    onRefresh()
  } catch (err) {
    console.error(err)
  }
}

  const handleEdit = (cv) => {
    setEditingCV(cv)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setEditingCV(null)
    setModalOpen(true)
  }

  return (
    <div>
      {/* Compact upload zone */}
      {/* GLOW 1: Top-Left of 'Applied' column */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '-40px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(91, 124, 246, 0.05) 50%, transparent 100%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* GLOW 2: Top-Right of 'Rejected' column */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, rgba(124, 58, 237, 0.03) 30%, transparent 100%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* GLOW 3: Dead-Center of the Kanban table layout */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, rgba(124, 58, 237, 0.04) 30%, transparent 10%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
      <div
        onClick={handleAdd}
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           '14px',
          border:        '1.5px dashed var(--glass-border-purple)',
          borderRadius:  'var(--radius)',
          padding:       '14px 18px',
          background:    'var(--accent-purple-dim)',
          cursor:        'pointer',
          marginBottom:  '16px',
          transition:    'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.16)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-purple-dim)'}
      >
        <div style={{
          width:          '36px',
          height:         '36px',
          borderRadius:   '8px',
          background:     'linear-gradient(135deg, #7c3aed, #5b7cf6)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       '16px',
          flexShrink:     0,
        }}>
          ↑
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
            Upload a CV
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
            PDF only · Max 5MB · Click to browse
          </p>
        </div>
        <button
          className="btn-gradient"
          style={{ marginLeft: 'auto', pointerEvents: 'none' }}
        >
          Upload CV
        </button>
      </div>

      {/* CV table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>CV</th>
              <th>Type</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cvVersions.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No CVs uploaded yet — upload your first one!
                </td>
              </tr>
            ) : (
              cvVersions.map((cv) => (
                <tr key={cv.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize:  '18px',
                        color:     'var(--accent-purple)',
                      }}>📄</span>
                      <span className="td-primary">{cv.label}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize:     '11px',
                      fontWeight:   600,
                      padding:      '3px 10px',
                      borderRadius: '20px',
                      background:   'var(--accent-purple-dim)',
                      border:       '1px solid var(--glass-border-purple)',
                      color:        '#a78bfa',
                    }}>
                      {cv.type}
                    </span>
                  </td>
                  <td className="td-mono">
                    {new Date(cv.uploaded_at).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td>
                    <div className="td-actions">
                      <button
                        className="action-btn"
                        onClick={() => handleEdit(cv)}
                      >
                        ✏ Update
                      </button>
                      <button
                        className="action-btn danger"
                        onClick={() => handleDelete(cv.id)}
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

      <CVModal
        key={editingCV?.id || 'new'}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCV(null) }}
        onSave={handleSave}
        cv={editingCV}
      />
      <ConfirmModal
      open={confirmOpen}
      onClose={() => { setConfirmOpen(false); setDeletingId(null) }}
      onConfirm={confirmDelete}
      title="Delete CV?"
      message="This CV will be deleted. Applications linked to it will be unlinked."
      />
    </div>
  )
}

export default CVVault