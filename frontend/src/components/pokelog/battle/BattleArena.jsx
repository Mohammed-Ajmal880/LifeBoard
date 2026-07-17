import { useState } from 'react'
import HPBar from './HPBar'
import MoveSelector from './MoveSelector'
import BattleLog from './BattleLog'
import Portal from '../../common/Portal'
import api from '../../../services/api'
import PokemonSelectModal from './PokemonSelectModal'
import ArenaBackground from './ArenaBackground'




function BattleArena({ open, onClose, battleState, goesFirst }) {
  const [state, setState] = useState(battleState)
  const [log, setLog] = useState([
    `${goesFirst === 'team1' ? battleState.team1_name : battleState.team2_name} moves first!`
  ])
  const [waiting, setWaiting] = useState(goesFirst == "team2")
  const [battleOver, setBattleOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [selectingPokemon, setSelectingPokemon] = useState(true)
  const [selectReason, setSelectReason] = useState('lead')
  const spriteMap = Object.fromEntries(
    battleState.team1.map(p => [p.name, { sprite: p.sprite, type: p.type }])
  )



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
        active_slot: state.team1[state.active1].slot,
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
      } else {
        // Check if player's active Pokémon fainted
        const updatedTeam1 = data.player_team
        const activePokemon = updatedTeam1.find(p => p.name === playerPokemon.name)
        const aliveRemaining = updatedTeam1.filter(p => !p.fainted)

        if (activePokemon?.fainted && aliveRemaining.length >= 1) {
          if (aliveRemaining.length === 1) {
            // Auto-switch to last remaining
            const lastIdx = data.player_team.findIndex(p => p.name === aliveRemaining[0].name)
            setState(prev => ({ ...prev, active1: lastIdx }))
          } else {
            // Let player choose
            setSelectReason('faint')
            setSelectingPokemon(true)
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setWaiting(false)
    }
  }

  const handlePokemonSelect = async (pokemon) => {
    const newIdx = state.team1.findIndex(p => p.name === pokemon.name)
    setState(prev => ({ ...prev, active1: newIdx }))
    setSelectingPokemon(false)

    // Synchronize manual faint replacement directly with the backend database
    if (selectReason === 'faint') {
      setWaiting(true)
      try {
        const res = await api.post(`/battles/${state.battle_id}/move`, {
          move_name: null, // Sending null lets the backend know this is an active swap
          active_slot: pokemon.slot,
        })
        const data = res.data
        setState(prev => ({
          ...prev,
          team1: data.player_team,
          team2: data.opponent_team,
          active1: data.player_team.findIndex(p => p.name === data.player_pokemon.name),
          active2: data.opponent_team.findIndex(p => p.name === data.opponent_pokemon.name),
        }))
        const formattedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        setLog(prev => [...prev, ...data.log, `${formattedName} was sent out!`]);
      } catch (err) {
        console.error("Failed to swap fainted Pokemon on backend:", err)
      } finally {
        setWaiting(false)
      }
      return
    }

    // Only trigger opponent move if this was lead selection + opponent goes first
    if (selectReason === 'lead' && goesFirst === 'team2') {
      setWaiting(true)
      const opponentPoke = state.team2[state.active2]
      const bestMove = opponentPoke.moves.reduce(
        (best, m) => ((m.power || 0) > (best.power || 0) ? m : best),
        opponentPoke.moves[0]
      )
      api.post(`/battles/${state.battle_id}/move`, {
        move_name: bestMove.name,
        move_power: bestMove.power || 40,
        move_type: bestMove.type,
        active_slot: pokemon.slot,
        submitted_by: 'opponent',
      }).then(res => {
        const data = res.data
        setState(prev => ({
          ...prev,
          team1: data.player_team,
          team2: data.opponent_team,
          active1: data.player_team.findIndex(p => p.name === data.player_pokemon.name),
          active2: data.opponent_team.findIndex(p => p.name === data.opponent_pokemon.name),
        }))
        setLog(prev => [...prev, ...data.log])
        if (data.battle_over) {
          setBattleOver(true)
          setWinner(data.winner)
        } else {
          const updatedTeam1 = data.player_team
          const activePokemon = updatedTeam1.find(p => p.name === pokemon.name) // pokemon.name is your selected lead
          const aliveRemaining = updatedTeam1.filter(p => !p.fainted)

          if (activePokemon?.fainted && aliveRemaining.length >= 1) {
            if (aliveRemaining.length === 1) {
              // Auto-switch to last remaining
              const lastIdx = data.player_team.findIndex(p => p.name === aliveRemaining[0].name)
              setState(prev => ({ ...prev, active1: lastIdx }))
              const lastPokeName = aliveRemaining[0].name.charAt(0).toUpperCase() + aliveRemaining[0].name.slice(1);
              setLog(prev => [...prev, `🟢 ${lastPokeName} was sent out!`]);
            } else {
              // Open select modal immediately
              setSelectReason('faint')
              setSelectingPokemon(true)
            }
          }
        }
      }).catch(err => console.error(err))
        .finally(() => setWaiting(false))
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

          <ArenaBackground>
            {/* Arena field */}
            <div style={{
              position: 'relative',
              height: '320px',
              background: `
              radial-gradient(circle at 75% 30%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 25% 70%, rgba(124, 58, 237, 0.15) 0%, transparent 60%),
              linear-gradient(to bottom, #111827 0%, #1f2937 45%, #374151 46%, #111827 100%)`,
              overflow: 'hidden',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>

              {/*  Perspective grid lines */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                height: '55%',
                opacity: 0.15,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                transform: 'perspective(200px) rotateX(60deg)',
                transformOrigin: 'top center',
              }} />

              {/* OPPONENT BATTLE PLATFORM (Top Right) */}
              <div style={{
                position: 'absolute',
                right: '80px',
                top: '180px',
                width: '220px',
                height: '45px',
                background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 70%)',
                borderRadius: '50%',
                border: '2px dashed rgba(59, 130, 246, 0.3)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
              }} />

              {/* PLAYER BATTLE PLATFORM (Bottom Left) */}
              <div style={{
                position: 'absolute',
                left: '50px',
                bottom: '85px',
                width: '260px',
                height: '55px',
                background: 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.6) 0%, rgba(124, 58, 237, 0) 70%)',
                borderRadius: '50%',
                border: '2px dashed rgba(124, 58, 237, 0.4)',
                boxShadow: '0 0 25px rgba(124, 58, 237, 0.5)',
              }} />

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
                  width: '160px',
                  height: '160px',
                  imageRendering: 'pixelated',
                  filter: opponentPokemon.current_hp === 0 ? 'grayscale(1) opacity(0.3)' : 'drop-shadow(0 0 12px rgba(59,130,246,0.4))',
                  transition: 'filter 0.5s ease',
                }}
              />

              {/* Player sprite — left side, larger */}
              <img
                src={playerPokemon.back_sprite || playerPokemon.sprite}
                alt={playerPokemon.name}
                style={{
                  position: 'absolute',
                  left: '60px',
                  bottom: '80px',
                  width: '200px',
                  height: '200px',
                  imageRendering: 'pixelated',
                  filter: playerPokemon.current_hp === 0 ? 'grayscale(1) opacity(0.3)' : 'drop-shadow(0 0 16px rgba(124,58,237,0.5))',
                  transition: 'filter 0.5s ease',
                  transform: 'scaleX(1)',
                }}
              />

              {/* Player HP card — bottom left */}
              <div style={{
                position: 'absolute',
                bottom: '1px',
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
          </ArenaBackground>

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
        <PokemonSelectModal
          open={selectingPokemon}
          team={state.team1}
          sprites={spriteMap}
          reason={selectReason}
          onSelect={handlePokemonSelect}
        />
      </div>
    </Portal>
  )
}

export default BattleArena