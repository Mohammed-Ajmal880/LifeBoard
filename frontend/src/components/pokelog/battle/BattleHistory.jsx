import { useState, useEffect } from 'react'
import api from '../../../services/api'

function BattleHistory() {
  const [battles, setBattles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    api.get('/battles/history')
      .then(res => { if (mounted) setBattles(res.data) })
      .catch(err => console.error(err))
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const wins   = battles.filter(b => b.winner === 'team1').length
  const losses = battles.filter(b => b.winner === 'team2').length

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', {
      day:    '2-digit',
      month:  'short',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'space-between',
        marginBottom:   '20px',
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Battle history
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Every finished battle is recorded here.
          </p>
        </div>

        {/* Win/Loss badges */}
        {!loading && battles.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              fontSize:     '12px',
              fontWeight:   700,
              padding:      '4px 12px',
              borderRadius: '20px',
              background:   'rgba(74,222,128,0.15)',
              border:       '1px solid rgba(74,222,128,0.35)',
              color:        '#4ade80',
            }}>
              {wins}W
            </span>
            <span style={{
              fontSize:     '12px',
              fontWeight:   700,
              padding:      '4px 12px',
              borderRadius: '20px',
              background:   'rgba(248,113,113,0.15)',
              border:       '1px solid rgba(248,113,113,0.35)',
              color:        '#f87171',
            }}>
              {losses}L
            </span>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading battle history...</p>
      )}

      {/* Empty state */}
      {!loading && battles.length === 0 && (
        <div style={{
          textAlign:    'center',
          padding:      '60px 24px',
          color:        'var(--text-muted)',
          background:   'rgba(255,255,255,0.02)',
          border:       '1px solid var(--glass-border)',
          borderRadius: 'var(--radius)',
        }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>⚔</p>
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            No battles yet
          </p>
          <p style={{ fontSize: '13px' }}>
            Head to the Teams tab and start your first battle!
          </p>
        </div>
      )}

      {/* Battle table */}
      {!loading && battles.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Your team</th>
                <th>Opponent</th>
                <th>Result</th>
                <th style={{ textAlign: 'right' }}>Turns</th>
              </tr>
            </thead>
            <tbody>
              {battles.map(battle => {
                const isWin = battle.winner === 'team1'
                const isDraw = !battle.winner
                return (
                  <tr key={battle.id}>
                    <td className="td-mono" style={{ fontSize: '12px' }}>
                      {formatDate(battle.created_at)}
                    </td>
                    <td className="td-primary">{battle.team1_name}</td>
                    <td>{battle.team2_name}</td>
                    <td>
                      <span style={{
                        fontSize:     '11px',
                        fontWeight:   700,
                        padding:      '3px 10px',
                        borderRadius: '20px',
                        background:   isDraw
                          ? 'rgba(255,255,255,0.08)'
                          : isWin
                          ? 'rgba(74,222,128,0.15)'
                          : 'rgba(248,113,113,0.15)',
                        border: isDraw
                          ? '1px solid rgba(255,255,255,0.15)'
                          : isWin
                          ? '1px solid rgba(74,222,128,0.35)'
                          : '1px solid rgba(248,113,113,0.35)',
                        color: isDraw ? '#888' : isWin ? '#4ade80' : '#f87171',
                        letterSpacing: '0.05em',
                      }}>
                        {isDraw ? 'DRAW' : isWin ? 'WIN' : 'LOSS'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }} className="td-mono">
                      {battle.turns}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default BattleHistory