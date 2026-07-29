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

    const wins = battles.filter(b => b.winner === 'team1').length
    const losses = battles.filter(b => b.winner === 'team2').length

    const formatDate = (iso) => {
        const d = new Date(iso)
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const handleClearHistory = async () => {
        if (window.confirm("Are you sure you want to permanently clear your battle history?")) {
            try {
                await api.delete('/battles/history')
                setBattles([]) // Clear local state immediately
            } catch (err) {
                console.error("Failed to clear history:", err)
            }
        }
    }

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '20px',
            }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                        Battle history
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Every finished battle is recorded here.
                    </p>
                </div>

                {/* Main Right Column Wrapper */}
                {!loading && battles.length > 0 && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '10px'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '8px',
                            alignItems: 'center'
                        }}>
                            <span style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: 'rgba(74,222,128,0.15)',
                                border: '1px solid rgba(74,222,128,0.35)',
                                color: '#4ade80',
                            }}>{wins}W</span>

                            <span style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: 'rgba(248,113,113,0.15)',
                                border: '1px solid rgba(248,113,113,0.35)',
                                color: '#f87171',
                            }}>{losses}L</span>
                        </div>
                        <button
                            onClick={handleClearHistory}
                            style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '5px 12px',
                                borderRadius: '6px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#f87171',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(248,113,113,0.15)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                        >
                            🗑 Clear History
                        </button>

                    </div>
                )}
            </div>

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
                                return (
                                    <tr key={battle.id}>
                                        <td className="td-mono" style={{ fontSize: '12px' }}>
                                            {formatDate(battle.created_at)}
                                        </td>
                                        <td className="td-primary">{battle.team1_name}</td>
                                        <td>{battle.team2_name}</td>
                                        <td>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                padding: '3px 10px',
                                                borderRadius: '20px',
                                                background: isWin ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                                                border: isWin ? '1px solid rgba(74,222,128,0.35)' : '1px solid rgba(248,113,113,0.35)',
                                                color: isWin ? '#4ade80' : '#f87171',
                                                letterSpacing: '0.05em',
                                            }}>
                                                {isWin ? 'WIN' : 'LOSS'}
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