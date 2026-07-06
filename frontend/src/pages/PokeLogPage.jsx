import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import WatchLog from '../components/pokelog/WatchLog'
import Teams from '../components/pokelog/Teams'
import Pokedex from '../components/pokelog/Pokedex'

const TABS = ['Watch log', 'Teams', 'Pokédex']

function PokeLogPage() {
  const [activeTab, setActiveTab] = useState('Watch log')
  const [entries, setEntries]     = useState([])
  const [teams, setTeams]         = useState([])
  const [loading, setLoading]     = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const [entriesRes, teamsRes] = await Promise.all([
        api.get('/watchlog/'),
        api.get('/pokemon_team/'),
      ])
      setEntries(entriesRes.data)

      const teamsWithMembers = await Promise.all(
        teamsRes.data.map(async (team) => {
          const membersRes = await api.get(`/pokemon_team/${team.id}/members`)
          return { ...team, members: membersRes.data }
        })
      )
      setTeams(teamsWithMembers)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line
    fetchAll()
  }, [fetchAll])

  return (
    <div className="page-container">

      {/* Page header */}
      <div className="page-header">
        <div>
          <p className="page-label">Module</p>
          <h1 className="page-title">PokeLog</h1>
          <p className="page-subtitle">
            Episodes watched, in-game teams, and a live Pokédex.
          </p>
        </div>
      </div>

      {/* Main panel */}
      <div style={{
        background:    'rgba(255,255,255,0.03)',
        border:        '1px solid var(--glass-border-strong)',
        borderRadius:  '16px',
        padding:       '20px',
        backdropFilter:'blur(12px)',
      }}>

        {/* Tabs */}
        <div style={{
          display:      'flex',
          gap:          '4px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--glass-border)',
          paddingBottom:'12px',
        }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding:      '6px 18px',
                borderRadius: '20px',
                fontSize:     '13px',
                fontWeight:   500,
                cursor:       'pointer',
                border:       activeTab === tab
                  ? '1px solid var(--glass-border-purple)'
                  : '1px solid transparent',
                background:   activeTab === tab
                  ? 'var(--accent-purple-dim)'
                  : 'none',
                color:        activeTab === tab
                  ? '#fff'
                  : 'var(--text-muted)',
                transition:   'all 0.2s',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>
            Loading...
          </p>
        ) : (
          <>
            {activeTab === 'Watch log' && (
              <WatchLog
                entries={entries}
                onRefresh={fetchAll}
              />
            )}
            {activeTab === 'Teams' && (
              <Teams
                teams={teams}
                onRefresh={fetchAll}
              />
            )}
            {activeTab === 'Pokédex' && (
              <Pokedex />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PokeLogPage