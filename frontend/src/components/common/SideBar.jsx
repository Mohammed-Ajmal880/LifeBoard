import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Briefcase, Gamepad2, Pickaxe, LayoutDashboard } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard',            path: '/dashboard',  icon: <LayoutDashboard size={16} /> },
  { label: 'Applications',         path: '/interntrack', icon: <Briefcase size={16} />       },
  { label: 'Pokemon Analytics',    path: '/pokelog',     icon: <Gamepad2 size={16} />        },
  { label: 'Minecraft Analytics',  path: '/minecraft',   icon: <Pickaxe size={16} />         },
]

function Sidebar({ collapsed }) {
  const { logout } = useAuth()

  return (
    <aside style={{
      width:          collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
      background:     'rgba(17,17,31,0.85)',
      borderRight:    '1px solid var(--glass-border-strong)',
      backdropFilter: 'blur(20px)',
      display:        'flex',
      flexDirection:  'column',
      transition:     'width 0.3s cubic-bezier(0.16,1,0.3,1)',
      overflow:       'hidden',
      flexShrink:     0,
      position:       'relative',
    }}>

      {/* Purple glow orb behind nav items */}
      <div style={{
        position:      'absolute',
        top:           '50%',
        left:          '50%',
        transform:     'translate(-50%, -60%)',
        width:         '180px',
        height:        '220px',
        borderRadius:  '50%',
        background:    'rgba(124, 58, 237, 0.12)',
        filter:        'blur(40px)',
        pointerEvents: 'none',
        zIndex:        0,
      }} />

      {/* Logo */}
      <div style={{
        padding:        collapsed ? '24px 0' : '24px 20px',
        borderBottom:   '1px solid var(--glass-border)',
        minHeight:      '72px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap:            '10px',
        position:       'relative',
        zIndex:         1,
      }}>
        <div style={{
          width:          '36px',
          height:         '36px',
          borderRadius:   '10px',
          background:     'linear-gradient(135deg, #7c3aed, #5b7cf6)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          boxShadow:      '0 0 14px rgba(124,58,237,0.5)',
          fontFamily:     'Orbitron, sans-serif',
          fontSize:       '12px',
          fontWeight:     900,
          color:          '#fff',
        }}>
          LB
        </div>
        {!collapsed && (
          <div>
            <div style={{
              fontFamily:           'Orbitron, sans-serif',
              fontWeight:           900,
              fontSize:             '17px',
              letterSpacing:        '0.1em',
              background:           'linear-gradient(135deg, #a78bfa, #5b7cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip:       'text',
            }}>
              LIFEBOARD
            </div>
            <div style={{
              fontSize:      '9px',
              color:         'var(--text-muted)',
              letterSpacing: '0.14em',
              marginTop:     '1px',
            }}>
              DASHBOARD
            </div>
          </div>
        )}
      </div>

      {/* Section label */}
      {!collapsed && (
        <div style={{
          fontSize:      '10px',
          fontWeight:    600,
          color:         'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding:       '16px 20px 6px',
          position:      'relative',
          zIndex:        1,
        }}>
          Modules
        </div>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display:        'flex',
              alignItems:     'center',
              gap:            '12px',
              padding:        collapsed ? '10px 0' : '8px 12px',
              margin:         collapsed ? '2px 0' : '2px 8px',
              borderRadius:   '8px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              fontSize:       '13px',
              fontWeight:     isActive ? 600 : 500,
              color:          isActive ? '#ffffff' : 'rgba(220, 220, 240, 0.85)',
              textShadow:     isActive ? '0 0 12px rgba(167,139,250,0.6)' : 'none',
              background:     isActive ? 'rgba(109,58,226,0.35)' : 'transparent',
              textDecoration: 'none',
              transition:     'all 0.2s',
              whiteSpace:     'nowrap',
              overflow:       'hidden',
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{
                  width:          '32px',
                  height:         '32px',
                  borderRadius:   '8px',
                  background:     isActive
                    ? 'linear-gradient(135deg, #7c3aed, #5b7cf6)'
                    : 'rgba(255,255,255,0.06)',
                  border:         isActive
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.08)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                  boxShadow:      isActive ? '0 0 10px rgba(124,58,237,0.4)' : 'none',
                  transition:     'all 0.2s',
                  color:          isActive ? '#fff' : 'rgba(220,220,240,0.7)',
                }}>
                  {item.icon}
                </div>
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom sign out */}
      <div style={{
        borderTop:  '1px solid var(--glass-border)',
        padding:    '8px 0',
        position:   'relative',
        zIndex:     1,
      }}>
        <button
          onClick={logout}
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            '12px',
            padding:        collapsed ? '10px 0' : '8px 12px',
            margin:         collapsed ? '2px 0' : '2px 8px',
            borderRadius:   '8px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            width:          collapsed ? '100%' : 'calc(100% - 16px)',
            background:     'none',
            border:         'none',
            color:          'rgba(200,200,220,0.7)',
            fontSize:       '13px',
            fontWeight:     500,
            cursor:         'pointer',
            transition:     'all 0.2s',
            whiteSpace:     'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color      = '#f87171'
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color      = 'rgba(200,200,220,0.7)'
            e.currentTarget.style.background = 'none'
          }}
        >
          <div style={{
            width:          '32px',
            height:         '32px',
            borderRadius:   '8px',
            background:     'rgba(255,255,255,0.05)',
            border:         '1px solid rgba(255,255,255,0.08)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '14px',
            flexShrink:     0,
            color:          'rgba(220,220,240,0.7)',
          }}>
            ↩
          </div>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar