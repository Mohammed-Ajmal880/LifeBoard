import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d
}

function formatDateKey(date) {
  return date.toISOString().split('T')[0]
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(20, 20, 35, 0.85)',
        border: '1px solid var(--glass-border-purple)',
        padding: '10px 14px',
        borderRadius: '8px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
          {label}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#fff', fontWeight: 700 }}>
          {payload[0].value} hours
        </p>
      </div>
    )
  }
  return null
}

function WeeklyChart({ sessions }) {
  const monday = getMonday(new Date())

  const weekData = DAYS.map((day, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const key = formatDateKey(date)

    const totalMinutes = sessions
      .filter(s => s.session_date === key)
      .reduce((sum, s) => sum + s.duration_minutes, 0)

    return {
      day,
      hours: parseFloat((totalMinutes / 60).toFixed(1)),
      isToday: key === formatDateKey(new Date()),
    }
  })

  return (
    /* 1. ✅ GLASSMORPHIC CARD CONTAINER */
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid var(--glass-border-strong, rgba(255, 255, 255, 0.08))',
      borderRadius: '16px',
      padding: '20px 20px 16px 20px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      width: '100%',
      boxSizing: 'border-box',
      marginTop: '30px',
      isolation: 'isolate',
      position: 'relative',
      zIndex: 0
    }}>
      
      {/* 2. ✅ ALIGNED HEADER LABELS */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <span style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '0.3px'
        }}>
          This week
        </span>
        <span style={{
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--text-muted, rgba(255, 255, 255, 0.4))'
        }}>
          hours/day
        </span>
      </div>

      {/* 3. CHART CONTAINER */}
      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          {/* Left margin is tucked inward slightly to compensate for Recharts Y-Axis spacing */}
          <BarChart data={weekData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#44445a' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#44445a' }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(124,58,237,0.08)' }}
            />
            
            <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
              {weekData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.hours > 0
                      ? 'url(#barGrad)'
                      : 'rgba(255,255,255,0.06)'
                  }
                />
              ))}
            </Bar>
            
            <defs>
              {/* Note: y2 set to 180 to anchor smoothly to our new graph container height */}
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#5b7cf6" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default WeeklyChart