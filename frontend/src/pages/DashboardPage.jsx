import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Briefcase, Gamepad2, Pickaxe, Target } from 'lucide-react'

const MODULE_CARDS = [
  {
    key:         'interntrack',
    label:       'JOB HUNT CRM',
    title:       'InternTrack',
    description: 'Log every internship application — company, role, CV version, status and notes — in one place.',
    icon: <Briefcase size={22} color="#fff" />,
    path:        '/interntrack',
    statKey:     'active_applications',
    statLabel:   'active applications',
    glow:        'rgba(124,58,237,0.25)',
  },
  {
    key:         'pokelog',
    label:       'ANIME & GAMES',
    title:       'PokeLog',
    description: 'Track episodes watched, your in-game teams, and search a live Pokédex of every species.',
    icon: <Gamepad2 size={22} color="#fff" />,
    path:        '/pokelog',
    statKey:     'episodes_watched',
    statLabel:   'episodes watched',
    glow:        'rgba(91,124,246,0.25)',
  },
  {
    key:         'minecraftstats',
    label:       'SESSION TRACKER',
    title:       'MinecraftStats',
    description: 'Log play sessions, set long-term goals, and visualise your weekly playtime as a chart.',
    icon: <Pickaxe size={22} color="#fff" />,
    path:        '/minecraft',
    statKey:     'total_sessions',
    statLabel:   'sessions logged',
    glow:        'rgba(124,58,237,0.2)',
  },
]

const GLANCE_CONFIG = [
  { key: 'apps_awaiting_reply', label: 'Apps awaiting reply',   sublabel: 'INTERNTRACK',    icon: <Briefcase size={16} color="#fff" />, grad: 'linear-gradient(135deg,#7c3aed,#5b7cf6)' },
  { key: 'episodes_watched',    label: 'Episodes watched',      sublabel: 'POKELOG',         icon: <Gamepad2  size={16} color="#fff" />, grad: 'linear-gradient(135deg,#5b7cf6,#7c3aed)' },
  { key: 'goals_in_progress',   label: 'Goals in progress',     sublabel: 'MINECRAFTSTATS',  icon: <Target    size={16} color="#fff" />, grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
  { key: 'weekly_playtime_hours',label: 'This week playtime',   sublabel: 'MINECRAFTSTATS',  icon: <Pickaxe   size={16} color="#fff" />, grad: 'linear-gradient(135deg,#5b7cf6,#a78bfa)', suffix: 'h' },
]

function DashboardPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(res => setSummary(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-container">

      {/* Welcome header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{
          fontSize:      '11px',
          fontWeight:    500,
          color:         'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom:  '8px',
        }}>
          Welcome back
        </p>
        <h1 style={{
          fontSize:      '42px',
          fontWeight:    800,
          color:         '#ffffff',
          letterSpacing: '-0.02em',
          lineHeight:    1.15,
          marginBottom:  '10px',
        }}>
          Hey, {user?.username || 'there'}. Where to today?
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Three little corners of your life, one quiet glass dashboard. Pick a module to dive in.
        </p>
      </div>

      {/* Module cards */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap:                 '16px',
        marginBottom:        '20px',
      }}>
        {MODULE_CARDS.map((mod) => {
          const statValue = summary?.module_stats?.[mod.key]?.[mod.statKey]
          return (
            <div
              key={mod.key}
              onClick={() => navigate(mod.path)}
              style={{
                background:    'rgba(255,255,255,0.04)',
                border:        '1px solid var(--glass-border-strong)',
                borderRadius:  '16px',
                padding:       '28px',
                cursor:        'pointer',
                position:      'relative',
                overflow:      'hidden',
                backdropFilter:'blur(16px)',
                transition:    'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                boxShadow:     `0 0 0 0 ${mod.glow}`,
              }}

              
              onMouseEnter={e => {
                e.currentTarget.style.transform   = 'translateY(-2px)'
                e.currentTarget.style.boxShadow   = `0 0 24px ${mod.glow}, 0 8px 32px rgba(0,0,0,0.3)`
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform   = 'translateY(0)'
                e.currentTarget.style.boxShadow   = '0 0 0 0 transparent'
                e.currentTarget.style.borderColor = 'var(--glass-border-strong)'
              }}
            >

              <div style={{
                position:     'absolute',
                top:          '-40px',
                right:        '-40px',
                width:        '150px',
                height:       '150px',
                borderRadius: '50%',
                background:   mod.glow,
                filter:       'blur(50px)',
                pointerEvents:'none',
                zIndex:       0,
              }} />
              
              {/* Arrow */}
              <div style={{
                position: 'absolute',
                top:      '18px',
                right:    '18px',
                fontSize: '14px',
                color:    'var(--text-muted)',
              }}>↗</div>

              {/* Icon avatar */}
              <div style={{
                width:          '48px',
                height:         '48px',
                borderRadius:   '12px',
                background:     'linear-gradient(135deg, #7c3aed, #5b7cf6)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       '22px',
                marginBottom:   '18px',
                boxShadow:      `0 0 16px ${mod.glow}`,
              }}>
                {mod.icon}
              </div>

              {/* Label */}
              <p style={{
                fontSize:      '10px',
                fontWeight:    600,
                color:         'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom:  '6px',
              }}>
                {mod.label}
              </p>

              {/* Title */}
              <h2 style={{
                fontSize:      '24px',
                fontWeight:    800,
                color:         '#ffffff',
                marginBottom:  '10px',
                letterSpacing: '-0.01em',
              }}>
                {mod.title}
              </h2>

              {/* Description */}
              <p style={{
                fontSize:     '13px',
                color:        'var(--text-secondary)',
                lineHeight:   1.6,
                marginBottom: '22px',
              }}>
                {mod.description}
              </p>

              {/* Stat */}
              <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                borderTop:      '1px solid var(--glass-border)',
                paddingTop:     '16px',
              }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Currently</span>
                <span style={{
                  fontSize:   '14px',
                  fontWeight: 700,
                  color:      '#ffffff',
                }}>
                  {loading ? '...' : `${statValue ?? 0} ${mod.statLabel}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Today at a glance */}
      <div style={{
        background:    'rgba(255,255,255,0.03)',
        border:        '1px solid var(--glass-border-strong)',
        borderRadius:  '16px',
        padding:       '24px',
        backdropFilter:'blur(16px)',
        position:      'relative',
        overflow:      'hidden',
      }}>
        <div style={{
        position:     'absolute',
        top:          '-60px',
        right:        '-60px',
        width:        '200px',
        height:       '200px',
        borderRadius: '50%',
        background:   'rgba(91,124,246,0.15)',
        filter:       'blur(60px)',
        pointerEvents:'none',
        }} />
        <div style={{
          position:     'absolute',
          top:          '-40px',
          right:        '22%',
          width:        '160px',
          height:       '160px',
          borderRadius: '50%',
          background:   'rgba(124,58,237,0.12)',
          filter:       'blur(50px)',
          pointerEvents:'none',
          }} />
        <div style={{
          position:     'absolute',
          top:          '-40px',
          right:        '48%',
          width:        '160px',
          height:       '160px',
          borderRadius: '50%',
          background:   'rgba(91,124,246,0.1)',
          filter:       'blur(50px)',
          pointerEvents:'none',
          }} />

        <h3 style={{
          fontSize:     '17px',
          fontWeight:   700,
          color:        '#ffffff',
          marginBottom: '16px',
        }}>
          Today at a glance
        </h3>
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap:                 '12px',
        }}>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>
          ) : (
            GLANCE_CONFIG.map((item) => {
              const raw = summary?.glance?.[item.key] ?? 0
              const val = item.suffix ? `${raw}${item.suffix}` : raw
              return (
                <div key={item.key} style={{
                  background:   'rgba(255,255,255,0.04)',
                  border:       '1px solid var(--glass-border-strong)',
                  borderRadius: '14px',
                  padding:      '16px',
                  transition:   'border-color 0.2s',
                }}>
                  {/* Gradient avatar */}
                  <div style={{
                    width:          '36px',
                    height:         '36px',
                    borderRadius:   '9px',
                    background:     item.grad,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    fontSize:       '16px',
                    marginBottom:   '12px',
                    boxShadow:      '0 0 10px rgba(124,58,237,0.3)',
                  }}>
                    {item.icon}
                  </div>

                  <p style={{
                    fontSize:     '12px',
                    color:        'var(--text-secondary)',
                    marginBottom: '6px',
                    lineHeight:   1.4,
                  }}>
                    {item.label}
                  </p>
                  <p style={{
                    fontSize:      '28px',
                    fontWeight:    700,
                    color:         '#ffffff',
                    letterSpacing: '-0.02em',
                    lineHeight:    1,
                    marginBottom:  '8px',
                  }}>
                    {val}
                  </p>
                  <p style={{
                    fontSize:      '10px',
                    fontWeight:    600,
                    color:         'var(--text-muted)',
                    letterSpacing: '0.08em',
                  }}>
                    {item.sublabel}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage