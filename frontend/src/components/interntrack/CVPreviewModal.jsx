import { useState, useEffect } from 'react'
import Portal from '../common/Portal'
import api from '../../services/api'

function CVPreviewModal({ open, onClose, cv }) {
    const [fileUrl, setFileUrl] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        if (!open || !cv?.id) return

        let isMounted = true

        api.get(`/cvs/${cv.id}/url`)
            .then(res => {
                if (isMounted) setFileUrl(res.data.url)
            })
            .catch(err => {
                if (isMounted) console.error("Error fetching CV URL:", err)
            })
            .finally(() => {
                if (isMounted) setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [open, cv?.id])

    if (!open || !cv) return null

    // Triggers direct browser download via Blob
    const handleDownload = async () => {
        if (!fileUrl) return
        try {
            setDownloading(true)
            const response = await fetch(fileUrl)
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)

            const link = document.createElement('a')
            link.href = blobUrl
            link.download = cv.file_name || `${cv.label}_CV.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
        } catch (err) {
            console.error("Download failed:", err)
            window.open(fileUrl, '_blank')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <Portal>
            <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <div className="modal-box" style={{ maxWidth: '820px', width: '90vw', padding: '24px' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
                                {cv.label}
                            </h2>
                            <span style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: '10px',
                                background: 'var(--accent-purple-dim)',
                                border: '1px solid var(--glass-border-purple)',
                                color: '#a78bfa',
                            }}>
                                {cv.type}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Mini-Window Viewport */}
                    <div style={{
                        width: '100%',
                        height: '60vh',
                        minHeight: '420px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--glass-border)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '18px',
                    }}>
                        {loading ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading document preview...</p>
                        ) : fileUrl ? (
                            <iframe
                                src={fileUrl}
                                title={cv.label}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                            />
                        ) : (
                            <p style={{ color: '#f87171', fontSize: '14px' }}>Failed to load document preview.</p>
                        )}
                    </div>

                    {/* Footer & Metadata Bar */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--glass-border)',
                    }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            📄 File: <span style={{ color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>{cv.file_name}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={onClose} className="btn-ghost">
                                Close
                            </button>
                            <button
                                onClick={handleDownload}
                                className="btn-gradient"
                                disabled={!fileUrl || downloading}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                📥 {downloading ? 'Downloading...' : 'Download CV'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </Portal>
    )
}

export default CVPreviewModal