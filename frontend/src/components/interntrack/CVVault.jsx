import { useState, useEffect } from 'react'
import CVModal from './CVModal'
import api from '../../services/api'
import ConfirmModal from '../common/ConfirmModal'
import CVPreviewModal from './CVPreviewModal'

// Sub-component to handle fetching file size per card dynamically
function CVCard({ cv, onPreview, onEdit, onDelete }) {
  const [fileSize, setFileSize] = useState(null)

  useEffect(() => {
    let isMounted = true

    if (!cv?.id) return

    // Fetch signed URL & issue a HEAD request to get Content-Length header
    api.get(`/cvs/${cv.id}/url`)
      .then(res => fetch(res.data.url, { method: 'HEAD' }))
      .then(res => {
        const bytes = res.headers.get('content-length')
        if (isMounted && bytes) {
          const mb = (Number(bytes) / (1024 * 1024)).toFixed(2)
          setFileSize(`${mb} MB`)
        } else if (isMounted) {
          setFileSize('PDF')
        }
      })
      .catch(() => {
        if (isMounted) setFileSize('PDF')
      })

    return () => {
      isMounted = false
    }
  }, [cv.id])

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius)',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.2s ease-in-out',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.4)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px -6px rgba(124, 58, 237, 0.2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--glass-border)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div>
        {/* Top Row: Icon, Title & Type Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <span style={{
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--accent-purple-dim)',
              border: '1px solid var(--glass-border-purple)',
              flexShrink: 0
            }}>
              📄
            </span>
            <h4
              onClick={() => onPreview(cv)}
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {cv.label}
            </h4>
          </div>

          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: '20px',
            background: 'var(--accent-purple-dim)',
            border: '1px solid var(--glass-border-purple)',
            color: '#a78bfa',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            {cv.type}
          </span>
        </div>

        {/* Metadata: Dynamic File Size in MB & Uploaded Date */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            💾 {fileSize || '...'}
          </span>
          <span>•</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            📅 {new Date(cv.uploaded_at).toLocaleDateString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        paddingTop: '12px',
        borderTop: '1px solid var(--glass-border)'
      }}>
        <button
          className="action-btn"
          onClick={() => onPreview(cv)}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          👁 View
        </button>
        <button
          className="action-btn"
          onClick={() => onEdit(cv)}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          ✏ Update
        </button>
        <button
          className="action-btn danger"
          onClick={() => onDelete(cv.id)}
          style={{ padding: '6px 10px', justifyContent: 'center' }}
        >
          🗑
        </button>
      </div>
    </div>
  )
}

function CVVault({ cvVersions, onRefresh }) {
  const [modalOpen, setModalOpen]       = useState(false)
  const [editingCV, setEditingCV]       = useState(null)
  const [confirmOpen, setConfirmOpen]   = useState(false)
  const [deletingId, setDeletingId]     = useState(null)

  // Preview Modal state
  const [previewOpen, setPreviewOpen]             = useState(false)
  const [selectedPreviewCV, setSelectedPreviewCV] = useState(null)

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
      setConfirmOpen(false)
      setDeletingId(null)
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

  const handlePreview = (cv) => {
    setSelectedPreviewCV(cv)
    setPreviewOpen(true)
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Ambient Background Glows */}
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

      {/* Header Bar with Compact Upload Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            CV Vault <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 400 }}>({cvVersions.length})</span>
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage, preview, and download your tailored resumes
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="btn-gradient"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> Upload CV
        </button>
      </div>

      {/* Card Grid Container */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {cvVersions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed var(--glass-border-purple)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}>
            No CVs uploaded yet — click <strong>+ Upload CV</strong> to get started!
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {cvVersions.map((cv) => (
              <CVCard
                key={cv.id}
                cv={cv}
                onPreview={handlePreview}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      <CVModal
        key={editingCV?.id || 'new'}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCV(null) }}
        onSave={handleSave}
        cv={editingCV}
      />

      {/* CV Mini-Window Preview & Download Modal */}
      <CVPreviewModal
        key={selectedPreviewCV?.id || 'none'}
        open={previewOpen}
        onClose={() => { setPreviewOpen(false); setSelectedPreviewCV(null) }}
        cv={selectedPreviewCV}
      />

      {/* Confirm Delete Modal */}
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