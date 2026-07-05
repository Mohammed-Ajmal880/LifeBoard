import { useState, useEffect } from 'react'
import api from '../services/api'
import KanbanBoard from '../components/interntrack/KanbanBoard'
import ApplicationTable from '../components/interntrack/ApplicationTable'
import ApplicationModal from '../components/interntrack/ApplicationModal'
import CVVault from '../components/interntrack/CVVault'

const TABS = ['Applications', 'CV Vault']
const VIEWS = ['Kanban', 'Table']

function InternTrackPage() {
  const [activeTab, setActiveTab] = useState('Applications')
  const [activeView, setActiveView] = useState('Kanban')
  const [applications, setApplications] = useState([])
  const [cvVersions, setCVVersions] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const [appsRes, cvsRes] = await Promise.all([
        api.get('/applications/'),
        api.get('/cvs/'),
      ])
      setApplications(appsRes.data)
      setCVVersions(cvsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    api.get('/applications/').then(appsRes => {
      api.get('/cvs/').then(cvsRes => {
        if (mounted) {
          setApplications(appsRes.data)
          setCVVersions(cvsRes.data)
          setLoading(false)
        }
      })
    }).catch(err => {
      console.error(err)
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const handleSave = async (payload) => {
    try {
      if (editingApp) {
        await api.patch(`/applications/${editingApp.id}`, payload)
      } else {
        await api.post('/applications/', payload)
      }
      setModalOpen(false)
      setEditingApp(null)
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (app) => {
    setEditingApp(app)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return
    try {
      await api.delete(`/applications/${id}`)
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddNew = () => {
    setEditingApp(null)
    setModalOpen(true)
  }

  // Stats computed from applications
  const statCounts = {
    applied: applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  const STAT_CARDS = [
    { label: 'APPLIED', value: statCounts.applied, sub: 'total' },
    { label: 'INTERVIEW', value: statCounts.interview, sub: 'active' },
    { label: 'OFFER', value: statCounts.offer, sub: 'in review' },
    { label: 'REJECTED', value: statCounts.rejected, sub: 'closed' },
  ]

  return (
    <div className="page-container">

      {/* Page header */}
      <div className="page-header">
        <div>
          <p className="page-label">Module</p>
          <h1 className="page-title">InternTrack</h1>
          <p className="page-subtitle">
            Every application, CV version, and outcome — in one calm board.
          </p>
        </div>
        <button className="btn-gradient" onClick={handleAddNew}>
          + Add application
        </button>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px',
        marginBottom: '20px',
      }}>
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{ color: '#fff' }}>{loading ? '—' : s.value}</p>
            <p className="stat-sub">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--glass-border-strong)',
        borderRadius: '16px',
        padding: '20px',
        backdropFilter: 'blur(12px)',
      }}>

        {/* Tab row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          {/* Page tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: activeTab === tab
                    ? '1px solid var(--glass-border-purple)'
                    : '1px solid transparent',
                  background: activeTab === tab
                    ? 'var(--accent-purple-dim)'
                    : 'none',
                  color: activeTab === tab
                    ? '#fff'
                    : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeTab === 'Applications' && (
              <>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {applications.length} applications
                </span>
                {/* View toggle */}
                <div style={{
                  display: 'flex',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                }}>
                  {VIEWS.map(view => (
                    <button
                      key={view}
                      onClick={() => setActiveView(view)}
                      style={{
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: activeView === view ? '#fff' : 'var(--text-muted)',
                        background: activeView === view ? 'var(--accent-purple-dim)' : 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {view === 'Kanban' ? '⊞ Kanban' : '☰ Table'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>
            Loading...
          </p>
        ) : activeTab === 'Applications' ? (
          activeView === 'Kanban' ? (
            <KanbanBoard
              applications={applications}
              cvVersions={cvVersions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <ApplicationTable
              applications={applications}
              cvVersions={cvVersions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )
        ) : (
          <CVVault
            cvVersions={cvVersions}
            onRefresh={fetchAll}
          />
        )}
      </div>

      {/* Application modal */}
      <ApplicationModal
        key={editingApp?.id || 'new'}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingApp(null) }}
        onSave={handleSave}
        application={editingApp}
        cvVersions={cvVersions}
      />
    </div>
  )
}

export default InternTrackPage