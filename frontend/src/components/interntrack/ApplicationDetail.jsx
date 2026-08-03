import Portal from '../common/Portal'

const STATUS_COLOURS = {
  applied:   { bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.4)',  color: '#60a5fa' },
  interview: { bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.4)',  color: '#fb923c' },
  offer:     { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.4)',   color: '#4ade80' },
  rejected:  { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.4)',   color: '#f87171' },
}

function ApplicationDetail({ open, onClose, application, cvVersions, onEdit, onDelete }) {
  if (!open || !application) return null

  const cv      = cvVersions.find(c => c.id === application.cv_version_id)
  const colours = STATUS_COLOURS[application.status] || STATUS_COLOURS.applied

  return (
    <Portal>
      <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-box" style={{ maxWidth: '520px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                {application.company}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {application.role}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}
            >✕</button>
          </div>

          {/* Status badge */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          '6px',
              padding:      '5px 14px',
              borderRadius: '20px',
              fontSize:     '12px',
              fontWeight:   600,
              background:   colours.bg,
              border:       `1px solid ${colours.border}`,
              color:        colours.color,
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colours.color, display: 'inline-block' }} />
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
          </div>

          {/* Info grid */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:                 '12px',
            marginBottom:        '20px',
          }}>
            <div style={{
              background:   'rgba(255,255,255,0.04)',
              border:       '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              padding:      '12px 14px',
            }}>
              <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Date applied
              </p>
              <p style={{ fontSize: '14px', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>
                {application.applied_date}
              </p>
            </div>

            <div style={{
              background:   'rgba(255,255,255,0.04)',
              border:       '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              padding:      '12px 14px',
            }}>
              <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                CV used
              </p>
              {cv ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#fff' }}>{cv.label}</span>
                  <span style={{
                    fontSize:     '10px',
                    fontWeight:   600,
                    padding:      '2px 7px',
                    borderRadius: '10px',
                    background:   'var(--accent-purple-dim)',
                    border:       '1px solid var(--glass-border-purple)',
                    color:        '#a78bfa',
                  }}>
                    {cv.type}
                  </span>
                </div>
              ) : (
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>None</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div style={{
            background:   'rgba(255,255,255,0.03)',
            border:       '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            padding:      '14px',
            marginBottom: '24px',
            minHeight:    '80px',
          }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Notes
            </p>
            <p style={{ fontSize: '13px', color: application.notes ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: 1.6, fontStyle: application.notes ? 'normal' : 'italic' }}>
              {application.notes || 'No notes added for this application.'}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Close
            </button>
            <button
              onClick={() => { onClose(); onEdit(application) }}
              className="btn-ghost"
              style={{ flex: 1, justifyContent: 'center', color: '#a78bfa', borderColor: 'rgba(124,58,237,0.3)' }}
            >
              ✏ Edit
            </button>
            <button
              onClick={() => { onClose(); onDelete(application.id) }}
              style={{
                flex:         1,
                height:       '40px',
                background:   'rgba(239,68,68,0.1)',
                border:       '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-sm)',
                color:        '#f87171',
                fontSize:     '13px',
                fontWeight:   500,
                cursor:       'pointer',
                transition:   'all 0.2s',
                display:      'flex',
                alignItems:   'center',
                justifyContent:'center',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            >
              🗑 Delete
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}

export default ApplicationDetail