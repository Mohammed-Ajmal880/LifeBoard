import { useState, useEffect } from 'react'
import { Pickaxe } from 'lucide-react'
import api from '../services/api'
import SessionsTable from '../components/minecraftstats/SessionsTable'
import GoalsPanel from '../components/minecraftstats/GoalsPanel'
import WeeklyChart from '../components/minecraftstats/WeeklyChart'
import SessionModal from '../components/minecraftstats/SessionModal'

function formatTotalHours(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function MinecraftPage() {
  const [sessions,     setSessions]     = useState([])
  const [goals,        setGoals]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [modalOpen,    setModalOpen]    = useState(false)

  const fetchAll = () => {
    let mounted = true
    Promise.all([
      api.get('/sessions/'),
      api.get('/goals/'),
    ]).then(([sessionsRes, goalsRes]) => {
      if (mounted) {
        setSessions(sessionsRes.data)
        setGoals(goalsRes.data)
        setLoading(false)
      }
    }).catch(err => {
      console.error(err)
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }

  useEffect(() => {
    const cleanup = fetchAll()
    return cleanup
  }, [])

  // Computed stats
  const totalMinutes   = sessions.reduce((sum, s) => sum + s.duration_minutes, 0)
  const activeGoals    = goals.filter(g => !g.completed).length
  const totalSessions  = sessions.length

  const STAT_CARDS = [
    {
      label: 'TOTAL PLAYTIME',
      value: loading ? '—' : formatTotalHours(totalMinutes),
      sub:   'this month',
      icon:  '🕐',
      grad:  'linear-gradient(135deg, #7c3aed, #5b7cf6)',
    },
    {
      label: 'ACTIVE GOALS',
      value: loading ? '—' : activeGoals,
      sub:   'in progress',
      icon:  '🎯',
      grad:  'linear-gradient(135deg, #5b7cf6, #7c3aed)',
    },
    {
      label: 'SESSIONS',
      value: loading ? '—' : totalSessions,
      sub:   'logged',
      icon:  '🎮',
      grad:  'linear-gradient(135deg, #7c3aed, #a78bfa)',
    },
  ]

  return (
    <div className="page-container">

      {/* Page header */}
      <div className="page-header">
        <div>
          <p className="page-label">Module</p>
          <h1 className="page-title">MinecraftStats</h1>
          <p className="page-subtitle">
            Sessions, builds, and long-term goals across all your worlds.
          </p>
        </div>
        <button
          className="btn-gradient"
          onClick={() => setModalOpen(true)}
        >
          <Pickaxe size={15} />
          Log session
        </button>
      </div>

      {/* Stat cards */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap:                 '14px',
        marginBottom:        '20px',
      }}>
        {STAT_CARDS.map((s) => (
          <div key={s.label} style={{
            background:    'rgba(255,255,255,0.04)',
            border:        '1px solid var(--glass-border-strong)',
            borderRadius:  'var(--radius)',
            padding:       '18px 20px',
            backdropFilter:'blur(12px)',
            display:       'flex',
            alignItems:    'center',
            gap:           '16px',
            transition:    'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border-strong)'}
          >
            {/* Icon avatar */}
            <div style={{
              width:          '44px',
              height:         '44px',
              borderRadius:   '10px',
              background:     s.grad,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       '20px',
              flexShrink:     0,
              boxShadow:      '0 0 12px rgba(124,58,237,0.3)',
            }}>
              {s.icon}
            </div>

            <div>
              <p style={{
                fontSize:      '10px',
                fontWeight:    600,
                color:         'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom:  '4px',
              }}>
                {s.label}
              </p>
              <p style={{
                fontSize:      '26px',
                fontWeight:    700,
                color:         '#fff',
                letterSpacing: '-0.02em',
                lineHeight:    1,
                marginBottom:  '3px',
              }}>
                {s.value}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {s.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content — sessions left, goals right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap:     '20px',
        alignItems: 'start',
      }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>
          ) : (
            <>
              <SessionsTable
                sessions={sessions}
                onRefresh={fetchAll}
              />
              <WeeklyChart sessions={sessions} />
            </>
          )}
        </div>

        {/* Right column — goals */}
        <GoalsPanel
          goals={goals}
          onRefresh={fetchAll}
        />
      </div>

      {/* Log session modal */}
      <SessionModal
        key={modalOpen ? 'open' : 'closed'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={async (payload) => {
          try {
            await api.post('/sessions/', payload)
            setModalOpen(false)
            fetchAll()
          } catch (err) {
            console.error(err)
          }
        }}
        session={null}
      />
    </div>
  )
}

export default MinecraftPage