import { useState, useEffect } from 'react'
import HPBar from './HPBar'
import MoveSelector from './MoveSelector'
import BattleLog from './BattleLog'
import Portal from '../../common/Portal'
import api from '../../../services/api'

const triggeredBattles = new Set()

function BattleArena({ open, onClose, battleState, goesFirst }) {
  const [state, setState] = useState(battleState)
  const [log, setLog] = useState([
    `${goesFirst === 'team1' ? battleState.team1_name : battleState.team2_name} moves first!`
  ])
  const [waiting, setWaiting] = useState(goesFirst == "team2")
  const [battleOver, setBattleOver] = useState(false)
  const [winner, setWinner] = useState(null)

  useEffect(() => {
    if (goesFirst !== 'team2') return
    if (triggeredBattles.has(state.battle_id)) return
    triggeredBattles.add(state.battle_id)

    const opponentPoke = state.team2[state.active2]
    const bestMove = opponentPoke.moves.reduce(
      (best, m) => ((m.power || 0) > (best.power || 0) ? m : best),
      opponentPoke.moves[0]
    )

    api.post(`/battles/${state.battle_id}/move`, {
      move_name:  bestMove.name,
      move_power: bestMove.power || 40,
      move_type:  bestMove.type,
      goes_first: goesFirst,
      submitted_by: 'opponent',
    }).then(res => {
      const data = res.data
      setState(prev => ({
        ...prev,
        team1:   data.player_team,
        team2:   data.opponent_team,
        active1: data.player_team.findIndex(p => p.name === data.player_pokemon.name),
        active2: data.opponent_team.findIndex(p => p.name === data.opponent_pokemon.name),
      }))
      setLog(prev => [...prev, ...data.log])
      if (data.battle_over) {
        setBattleOver(true)
        setWinner(data.winner)
      }
    }).catch(err => {
      console.error(err)
    }).finally(() => {
      setWaiting(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps


  if (!open) return null

  const playerPokemon = state.team1[state.active1]
  const opponentPokemon = state.team2[state.active2]



  const handleMove = async (move) => {
    if (waiting || battleOver) return
    setWaiting(true)

    try {
      const res = await api.post(`/battles/${state.battle_id}/move`, {
        move_name: move.name,
        move_power: move.power || 40,
        move_type: move.type,
      })
      const data = res.data

      setState(prev => ({
        ...prev,         // ← uses latest state, not stale closure
        team1: data.player_team,
        team2: data.opponent_team,
        active1: data.player_team.findIndex(p => p.name === data.player_pokemon.name),
        active2: data.opponent_team.findIndex(p => p.name === data.opponent_pokemon.name),
      }))

      setLog(prev => [...prev, ...data.log])

      if (data.battle_over) {
        setBattleOver(true)
        setWinner(data.winner)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setWaiting(false)
    }
  }

  return (
    <Portal>
      <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && !battleOver && onClose()}>
        <div style={{
          background: 'linear-gradient(160deg, rgba(20,15,50,0.99) 0%, rgba(8,8,28,0.99) 100%)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1000px',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.9)',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>⚔</span>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: 0 }}>
                {state.team1_name} vs {state.team2_name}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-muted)',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >✕</button>
          </div>

          {/* Battle over banner */}
          {battleOver && (
            <div style={{
              background: winner === 'team1'
                ? 'linear-gradient(90deg, rgba(74,222,128,0.2), transparent)'
                : 'linear-gradient(90deg, rgba(248,113,113,0.2), transparent)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <p style={{ fontSize: '15px', fontWeight: 700, color: winner === 'team1' ? '#4ade80' : '#f87171', margin: 0 }}>
                {winner === 'team1' ? `🏆 ${state.team1_name} wins!` : `💀 ${state.team2_name} wins!`}
              </p>
              <button className="btn-gradient" onClick={onClose} style={{ padding: '6px 16px', fontSize: '13px' }}>
                Close
              </button>
            </div>
          )}

          {/* Arena field */}
          <div style={{
            position: 'relative',
            height: '320px',
            background: 'radial-gradient(ellipse at 30% 60%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 40%, rgba(59,130,246,0.08) 0%, transparent 60%)',
            overflow: 'hidden',
          }}>

            {/* Opponent HP card — top right */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '12px 16px',
              minWidth: '220px',
              backdropFilter: 'blur(8px)',
            }}>
              <HPBar
                current={opponentPokemon.current_hp}
                max={opponentPokemon.max_hp}
                label="Opponent"
                sublabel={opponentPokemon.name.charAt(0).toUpperCase() + opponentPokemon.name.slice(1)}
              />
            </div>

            {/* Opponent sprite — right side, smaller */}
            <img
              src={opponentPokemon.sprite}
              alt={opponentPokemon.name}
              style={{
                position: 'absolute',
                right: '120px',
                top: '80px',
                width: '120px',
                height: '120px',
                imageRendering: 'pixelated',
                filter: opponentPokemon.current_hp === 0 ? 'grayscale(1) opacity(0.3)' : 'drop-shadow(0 0 12px rgba(59,130,246,0.4))',
                transition: 'filter 0.5s ease',
              }}
            />

            {/* Player sprite — left side, larger */}
            <img
              src={playerPokemon.sprite}
              alt={playerPokemon.name}
              style={{
                position: 'absolute',
                left: '60px',
                bottom: '80px',
                width: '160px',
                height: '160px',
                imageRendering: 'pixelated',
                filter: playerPokemon.current_hp === 0 ? 'grayscale(1) opacity(0.3)' : 'drop-shadow(0 0 16px rgba(124,58,237,0.5))',
                transition: 'filter 0.5s ease',
              }}
            />

            {/* Player HP card — bottom left */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '12px 16px',
              minWidth: '240px',
              backdropFilter: 'blur(8px)',
            }}>
              <HPBar
                current={playerPokemon.current_hp}
                max={playerPokemon.max_hp}
                label="Your Pokémon"
                sublabel={playerPokemon.name.charAt(0).toUpperCase() + playerPokemon.name.slice(1)}
              />
            </div>

            {/* Turn indicator */}
            {!battleOver && (
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: waiting ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.3)',
                border: '1px solid rgba(124,58,237,0.5)',
                borderRadius: '20px',
                padding: '6px 18px',
                fontSize: '11px',
                fontWeight: 600,
                color: waiting ? 'var(--text-muted)' : '#fff',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'all 0.3s',
              }}>
                {waiting ? '⏳ Processing...' : '⚡ Your turn'}
              </div>
            )}
          </div>

          {/* Bottom section */}
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            padding: '20px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '16px' }}>
              {/* Moves */}
              <MoveSelector
                moves={playerPokemon.moves}
                onSelectMove={handleMove}
                disabled={waiting || battleOver}
              />
              {/* Log */}
              <BattleLog entries={log} />
            </div>

            {/* Bench */}
            <div>
              <p style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}>
                Your bench
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {state.team1.map((pokemon, i) => {
                  const isActive = i === state.active1
                  const isFainted = pokemon.fainted
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px 5px 6px',
                      borderRadius: '20px',
                      background: isActive
                        ? 'rgba(124,58,237,0.3)'
                        : isFainted
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(255,255,255,0.06)',
                      border: isActive
                        ? '1px solid rgba(124,58,237,0.6)'
                        : '1px solid rgba(255,255,255,0.08)',
                      opacity: isFainted ? 0.4 : 1,
                      transition: 'all 0.2s',
                    }}>
                      <img
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        style={{
                          width: '28px',
                          height: '28px',
                          imageRendering: 'pixelated',
                          filter: isFainted ? 'grayscale(1)' : 'none',
                        }}
                      />
                      <span style={{
                        fontSize: '12px',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#fff' : 'var(--text-muted)',
                        textTransform: 'capitalize',
                      }}>
                        {pokemon.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}

export default BattleArena