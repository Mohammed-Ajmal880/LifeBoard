const COLUMNS = [
  { key: 'applied', label: 'Applied', color: '#5b7cf6' },
  { key: 'interview', label: 'Interview', color: '#fb923c' },
  { key: 'offer', label: 'Offer', color: '#4ade80' },
  { key: 'rejected', label: 'Rejected', color: '#f87171' },
]

function KanbanBoard({ applications, cvVersions, onEdit, onDelete }) {
  const getCV = (id) => cvVersions.find(cv => cv.id === id)

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = applications.filter(a => a.status === col.key)
    return acc
  }, {})

  return (
    <>
      <div style={{ position: 'relative', width: '100%' }}>
        {/* ✨ GLOW 1: Top-Left of 'Applied' column */}
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

        {/* ✨ GLOW 2: Top-Right of 'Rejected' column */}
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

        {/* ✨ GLOW 3: Dead-Center of the Kanban table layout */}
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

      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px',
      }}>
        {COLUMNS.map((col) => (
          <div key={col.key} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius)',
            padding: '14px',
            minHeight: '300px',
            backdropFilter: 'blur(10px)',
          }}>
            {/* Column header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: col.color,
                background: `${col.color}18`,
                border: `1px solid ${col.color}40`,
                padding: '3px 10px',
                borderRadius: '20px',
              }}>
                {col.label}
              </span>
              <span style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--glass-border-strong)',
                padding: '2px 8px',
                borderRadius: '10px',
              }}>
                {grouped[col.key].length}
              </span>
            </div>

            {/* Cards */}
            {grouped[col.key].length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '32px 12px',
                color: 'var(--text-muted)',
                fontSize: '12px',
                lineHeight: 1.6,
              }}>
                No applications
              </div>
            ) : (
              grouped[col.key].map((app) => {
                const cv = getCV(app.cv_version_id)
                return (
                  <div
                    key={app.id}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--glass-border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                      marginBottom: '8px',
                      backdropFilter: 'blur(8px)',
                      transition: 'border-color 0.2s, transform 0.15s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--glass-border-strong)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', marginBottom: '2px' }}>
                      {app.company}
                    </p>
                    <p style={{ fontSize: '12px', color: '#e2e8f0', marginBottom: '8px' }}>
                      {app.role}
                    </p>

                    {/* CV + date row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: app.notes ? '8px' : '10px',
                      fontSize: '11px',
                      color: '#94a3b8',
                    }}>
                      <span>📄 <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{cv ? cv.label : '—'}</span></span>
                      <span>{app.applied_date}</span>
                    </div>

                    {/* Notes preview */}
                    {app.notes && (
                      <p style={{
                        fontSize: '11px',
                        color: '#cbd5e1',
                        lineHeight: 1.4,
                        borderTop: '1px solid var(--glass-border)',
                        paddingTop: '8px',
                        marginBottom: '10px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {app.notes}
                      </p>
                    )}

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      gap: '6px',
                      borderTop: '1px solid var(--glass-border)',
                      paddingTop: '8px',
                    }}>
                      <button
                        onClick={() => onEdit(app)}
                        style={{
                          flex: 1,
                          background: 'none',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '6px',
                          color: '#949494',
                          fontSize: '11px',
                          padding: '5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#fff'
                          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = '#949494'
                          e.currentTarget.style.borderColor = 'var(--glass-border)'
                        }}
                      >
                        ✏ Update
                      </button>
                      <button
                        onClick={() => onDelete(app.id)}
                        style={{
                          flex: 1,
                          background: 'none',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '6px',
                          color: '#949494',
                          fontSize: '11px',
                          padding: '5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#f87171'
                          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = '#949494'
                          e.currentTarget.style.borderColor = 'var(--glass-border)'
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ))}
      </div>
    </>

  )
}

export default KanbanBoard