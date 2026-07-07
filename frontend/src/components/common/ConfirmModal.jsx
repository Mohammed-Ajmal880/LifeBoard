import Portal from './Portal'

function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) {
  if (!open) return null

  return (
    <Portal>
      <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-box" style={{ maxWidth: '380px', textAlign: 'center' }}>

          {/* Icon */}
          <div style={{
            width:          '52px',
            height:         '52px',
            borderRadius:   '50%',
            background:     danger ? 'rgba(239,68,68,0.15)' : 'var(--accent-purple-dim)',
            border:         danger ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--glass-border-purple)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '22px',
            margin:         '0 auto 18px',
          }}>
            {danger ? '🗑' : '⚠️'}
          </div>

          {/* Title */}
          <h2 style={{
            fontSize:     '17px',
            fontWeight:   600,
            color:        '#fff',
            marginBottom: '8px',
          }}>
            {title || 'Are you sure?'}
          </h2>

          {/* Message */}
          <p style={{
            fontSize:     '13px',
            color:        'var(--text-secondary)',
            lineHeight:   1.6,
            marginBottom: '24px',
          }}>
            {message || 'This action cannot be undone.'}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(); onClose() }}
              style={{
                flex:         1,
                height:       '40px',
                background:   danger
                  ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                  : 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                border:       'none',
                borderRadius: 'var(--radius-sm)',
                color:        '#fff',
                fontSize:     '13px',
                fontWeight:   600,
                cursor:       'pointer',
                transition:   'opacity 0.2s',
                display:      'flex',
                alignItems:   'center',
                justifyContent:'center',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}

export default ConfirmModal