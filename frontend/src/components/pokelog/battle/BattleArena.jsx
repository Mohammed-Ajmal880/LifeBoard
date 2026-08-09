import { useState, useEffect, useRef } from 'react'
import HPBar from './HPBar'
import MoveSelector from './MoveSelector'
import BattleLog from './BattleLog'
import Portal from '../../common/Portal'
import api from '../../../services/api'
import PokemonSelectModal from './PokemonSelectModal'
import ArenaBackground from './ArenaBackground'
import ConfirmModal from '../../common/ConfirmModal'


// Global reference to ensure only ONE cry plays at any given time
let activeCryAudio = null

// Helper to fetch and play official Showdown Pokémon cries
const playPokemonCry = (pokemonName, volume = 0.15) => {
  if (!pokemonName) return

  // Immediately stop any cry currently playing so sounds never overlap
  if (activeCryAudio) {
    activeCryAudio.pause()
    activeCryAudio.currentTime = 0
  }

  const formattedName = pokemonName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const cryUrl = `https://play.pokemonshowdown.com/audio/cries/${formattedName}.mp3`

  activeCryAudio = new Audio(cryUrl)
  activeCryAudio.volume = volume
  activeCryAudio.play().catch(err => {
    console.warn(`Could not play cry for ${pokemonName}:`, err)
  })
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function BattleArena({ open, onClose, battleState, goesFirst }) {
  const [state, setState] = useState(battleState) // Tracks the current battle state (teams, active Pokémon, etc.)
  const [log, setLog] = useState([
    `${goesFirst === 'team1' ? battleState.team1_name : battleState.team2_name} moves first!`
  ]) // Tracks the battle log entries to display in the UI

  const [waiting, setWaiting] = useState(goesFirst === "team2") // Tracks whether the player is waiting for the opponent's turn to finish
  const [battleOver, setBattleOver] = useState(false) // Tracks whether the battle has ended
  const [winner, setWinner] = useState(null) // Tracks which team won the battle ('team1' or 'team2')
  const [selectingPokemon, setSelectingPokemon] = useState(true) // Tracks whether the Pokémon selection modal is open
  const [selectReason, setSelectReason] = useState('lead') // 'lead' for initial selection, 'faint' for mid-battle faint replacement
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false) // Tracks the leave confirmation modal state
  const [attacking, setAttacking] = useState(null) // 'player' or 'opponent' to trigger attack-lunge effect
  const [hitTarget, setHitTarget] = useState(null) // 'player' or 'opponent' to trigger hit-shake effect 
  const bgmRef = useRef(null) // Reference for the audio element to play background music
  const cryRef = useRef(null) // Reference for the audio element to play Pokémon cries
  const victory = useRef(null) // Reference for the audio element to play victory music
  const defeat = useRef(null) // Reference for the audio element to play defeat music
  const prevActive1Ref = useRef(null) // Tracks the players previous active Pokémon index
  const prevActive2Ref = useRef(null) // Tracks the opponents previous active Pokémon index
  const hasPlayedLeadIntro = useRef(false) // Tracks whether the initial lead cry sequence has already been played


  // Reset lead intro & slot trackers whenever the arena modal opens/closes
  useEffect(() => {
    if (!open) {
      hasPlayedLeadIntro.current = false
      prevActive1Ref.current = null
      prevActive2Ref.current = null
    }
  }, [open])

  // Entrance cry controller 
  useEffect(() => {
    if (!open || selectingPokemon) return

    let isCancelled = false

    // =========================================================
    // 1. INITIAL BATTLE LEAD SEQUENCE
    //    Player Lead Cry ---> 2400ms Pause ---> Opponent Lead Cry
    // =========================================================
    if (selectReason === 'lead' && !hasPlayedLeadIntro.current) {
      hasPlayedLeadIntro.current = true
      prevActive1Ref.current = state.active1
      prevActive2Ref.current = state.active2

      const playLeadSequence = async () => {
        const playerPoke = state.team1[state.active1]
        const opponentPoke = state.team2[state.active2]

        // 🎵 1. Play Player Lead Cry immediately
        if (playerPoke && playerPoke.current_hp > 0) {
          playPokemonCry(playerPoke.name)
        }

        // 2. Pause 2400ms so player cry finishes completely
        await sleep(2400)
        if (isCancelled) return

        // 3. Play Opponent Lead Cry
        if (opponentPoke && opponentPoke.current_hp > 0) {
          playPokemonCry(opponentPoke.name)
        }
      }

      playLeadSequence()

      return () => {
        isCancelled = true
      }
    }

    const playerActiveChanged = prevActive1Ref.current !== null && prevActive1Ref.current !== state.active1
    const opponentActiveChanged = prevActive2Ref.current !== null && prevActive2Ref.current !== state.active2

    // =========================================================
    // 2. MID-BATTLE PLAYER FAINT SWITCH
    //    Takes priority & syncs opponent ref to prevent cross-firing
    // =========================================================
    if (playerActiveChanged) {
      prevActive1Ref.current = state.active1
      prevActive2Ref.current = state.active2
      const playerPoke = state.team1[state.active1]
      if (playerPoke && playerPoke.current_hp > 0) {
        playPokemonCry(playerPoke.name)
      }
    } 
    // =========================================================
    // 3. MID-BATTLE OPPONENT FAINT SWITCH
    //    Only plays when opponent active slot actually changes on its own
    // =========================================================
    else if (opponentActiveChanged) {
      prevActive2Ref.current = state.active2
      const opponentPoke = state.team2[state.active2]
      if (opponentPoke && opponentPoke.current_hp > 0) {
        playPokemonCry(opponentPoke.name)
      }
    } else {
      prevActive1Ref.current = state.active1
      prevActive2Ref.current = state.active2
    }
  }, [open, selectingPokemon, selectReason, state.active1, state.active2])

  // 1. Initialize BGM, Pokémon Cry SFX, and Victory/Defeat SFX on first render
  useEffect(() => {

    bgmRef.current = new Audio('https://2xssxetuewd7953l.public.blob.vercel-storage.com/xy-trainer.mp3')
    bgmRef.current.loop = true
    bgmRef.current.volume = 0.05

    cryRef.current = new Audio('https://2xssxetuewd7953l.public.blob.vercel-storage.com/PokemonCry.wav')
    cryRef.current.volume = 0.65

    victory.current = new Audio('https://2xssxetuewd7953l.public.blob.vercel-storage.com/PokeVictory.mp3')
    victory.current.volume = 0.30

    defeat.current = new Audio('https://2xssxetuewd7953l.public.blob.vercel-storage.com/Defeat.mp3')
    defeat.current.volume = 0.15

    // 3. Stop music if the user navigates away or modal unmounts
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause()
        bgmRef.current.currentTime = 0
      }
    }
  }, [])

  // 2. Play battle theme when the modal opens, pause when it closes or battle ends
  useEffect(() => {
    if (!bgmRef.current) return

    const isSelectingLead = selectingPokemon && selectReason === 'lead'

    if (open && !isSelectingLead && !battleOver) {
      bgmRef.current.play().catch(err => {
        console.log('Autoplay deferred by browser interaction policy:', err)
      })
    } else {
      bgmRef.current.pause()
      if (battleOver) {
        bgmRef.current.currentTime = 0 // Rewind track for next match
      }
    }
  }, [open, selectingPokemon, selectReason, battleOver])

  useEffect(() => {
    if (hitTarget && cryRef.current) {
      cryRef.current.currentTime = 0
      cryRef.current.play().catch(err => {
        console.log('SFX error:', err)
      })
    }
  }, [hitTarget])

  // 3. Play victory/defeat audio when a winner is declared
  useEffect(() => {
    if (!open || !battleOver) return

    // 1. Play the victory/defeat track based on who won
    if (winner === 'team1' && victory.current) {
      victory.current.currentTime = 0
      victory.current.play().catch(err => console.log('Victory SFX error:', err))
    } else if (winner === 'team2' && defeat.current) {
      defeat.current.currentTime = 0
      defeat.current.play().catch(err => console.log('Defeat SFX error:', err))
    }

    // Runs automatically when open turns false
    return () => {
      if (victory.current) {
        victory.current.pause()
        victory.current.currentTime = 0
      }
      if (defeat.current) {
        defeat.current.pause()
        defeat.current.currentTime = 0
      }
    }
  }, [open, battleOver, winner])



  const spriteMap = Object.fromEntries(
    battleState.team1.map(p => [p.name, { sprite: p.sprite, type: p.type }])
  )

  if (!open) return null

  const playerPokemon = state.team1[state.active1]
  const opponentPokemon = state.team2[state.active2]

  // Handle the close request, showing a confirmation modal if the battle is still ongoing
  const handleRequestClose = () => {
    if (battleOver) {
      onClose()
    } else {
      setShowLeaveConfirm(true)
    }
  }

  // Handle the player selecting a move, sending the request to the backend and managing the battle state updates
  const handleMove = async (move) => {
    if (waiting || battleOver || playerPokemon.current_hp === 0) return

    setWaiting(true)

    try {
      // 1. Start backend calculation & player lunge at the exact same time
      const apiPromise = api.post(`/battles/${state.battle_id}/move`, {
        move_name: move.name,
        move_power: move.power || 40,
        move_type: move.type,
        active_slot: state.team1[state.active1].slot,
      })

      // Player attack animation immediately
      setAttacking('player')
      await sleep(200)
      setHitTarget('opponent')

      // Wait for backend move calculations to complete
      const res = await apiPromise
      const data = res.data

      const playerLog = data.log.length > 0 ? [data.log[0]] : []
      const opponentLog = data.log.slice(1)

      const currentOpponentIdx = state.active2
      const updatedOpponent = data.opponent_team.find(p => p.name === opponentPokemon.name)
      const opponentFainted = updatedOpponent && updatedOpponent.fainted

      // Drop opponent hp immediately on impact
      setState(prev => ({
        ...prev,
        team2: data.opponent_team,
        active2: currentOpponentIdx,
      }))
      if (playerLog.length > 0) setLog(prev => [...prev, ...playerLog])

      // Play faint cry immediately on impact
      if (opponentFainted) {
        playPokemonCry(opponentPokemon.name, 0.3)
        await sleep(1300)
      }

      await sleep(250)
      setAttacking(null)
      await sleep(150)
      setHitTarget(null)

      // Pause to watch the opponent HP bar drain & hear faint cry
      await sleep(500)

      // If opponent faintd & match is not over; swap in new opponent
      const newOpponentIdx = data.opponent_team.findIndex(p => p.name === data.opponent_pokemon?.name)
      if (opponentFainted && !data.battle_over && newOpponentIdx !== -1 && newOpponentIdx !== currentOpponentIdx) {
        setState(prev => ({
          ...prev,
          active2: newOpponentIdx,
        }))
        await sleep(400) // Brief pause while new opponent steps out & plays entrance cry
      }

      // =========================================================
      // PHASE 2: Opponent counter-attack (If opponent survived)
      // =========================================================
      const updatedPlayerPoke = data.player_team.find(p => p.name === playerPokemon.name)
      const playerTookDamage = updatedPlayerPoke && updatedPlayerPoke.current_hp < playerPokemon.current_hp

      if (!opponentFainted && playerTookDamage) {
        setAttacking('opponent')
        await sleep(200)
        setHitTarget('player')

        // Drop player hp immediately on impact
        setState(prev => ({
          ...prev,
          team1: data.player_team,
          active1: data.player_team.findIndex(p => p.name === data.player_pokemon.name),
        }))
        if (opponentLog.length > 0) setLog(prev => [...prev, ...opponentLog])

        // Play player faint cry if needed
        if (updatedPlayerPoke && updatedPlayerPoke.fainted) {
          playPokemonCry(playerPokemon.name, 0.3)
        }

        await sleep(250)
        setAttacking(null)
        await sleep(150)
        setHitTarget(null)

        // Brief pause to watch player HP bar drain
        await sleep(300)
      } else if (opponentLog.length > 0) {
        // Append leftover logs if opponent didn't counter-attack
        setLog(prev => [...prev, ...opponentLog])
      }

      // =========================================================
      // PHASE 3: Fainting and victory logic (If either side fainted or battle is over)
      // =========================================================
      if (data.battle_over) {
        setBattleOver(true)
        setWinner(data.winner)
      } else if (updatedPlayerPoke && updatedPlayerPoke.fainted) {
        const aliveRemaining = data.player_team.filter(p => !p.fainted)
        if (aliveRemaining.length > 0) {
          setSelectReason('faint')
          setSelectingPokemon(true) // Faint modal opens after all animations finish
        }
      }

    } catch (err) {
      console.error('Turn execution error:', err)
    } finally {
      setAttacking(null)
      setHitTarget(null)
      setWaiting(false)
    }
  }

  // Handle the player selecting the available pokemon during lead or faint replacements
  const handlePokemonSelect = async (pokemon) => {
    const newIdx = state.team1.findIndex(p => p.name === pokemon.name);
    setState(prev => ({ ...prev, active1: newIdx }));
    setSelectingPokemon(false);

    // Manual faint replacement
    if (selectReason === 'faint') {
      setWaiting(true);
      try {
        const res = await api.post(`/battles/${state.battle_id}/move`, {
          move_name: null,
          active_slot: pokemon.slot,
        });
        const data = res.data;
        setState(prev => ({
          ...prev,
          team1: data.player_team,
          team2: data.opponent_team,
          active1: data.player_team.findIndex(p => p.name === data.player_pokemon.name),
          active2: data.opponent_team.findIndex(p => p.name === data.opponent_pokemon.name),
        }));
        const formattedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        setLog(prev => [...prev, ...data.log, `${formattedName} was sent out!`]);
      } catch (err) {
        console.error("Failed to swap fainted Pokemon on backend:", err);
      } finally {
        setWaiting(false);
      }
      return;
    }

    // Opponent attacks first on initial lead execution
    if (selectReason === 'lead' && goesFirst === 'team2') {
      setWaiting(true);
      const opponentPoke = state.team2[state.active2];
      const bestMove = opponentPoke.moves.reduce(
        (best, m) => ((m.power || 0) > (best.power || 0) ? m : best),
        opponentPoke.moves[0]
      );

      try {
        // Brief 500ms delay so entrance cries play & battle scene settles before attack
        await sleep(2200);

        const apiPromise = api.post(`/battles/${state.battle_id}/move`, {
          move_name: bestMove.name,
          move_power: bestMove.power || 40,
          move_type: bestMove.type,
          active_slot: pokemon.slot,
          submitted_by: 'opponent',
        });

        setAttacking('opponent');
        await sleep(200);

        setHitTarget('player');

        const res = await apiPromise;
        const data = res.data;

        // Drop player hp immediately on impact
        setState(prev => ({
          ...prev,
          team1: data.player_team,
          team2: data.opponent_team,
          active1: data.player_team.findIndex(p => p.name === data.player_pokemon.name),
          active2: data.opponent_team.findIndex(p => p.name === data.opponent_pokemon.name),
        }));
        setLog(prev => [...prev, ...data.log]);

        // Play faint cry if player fainted
        const updatedPlayerPoke = data.player_team.find(p => p.name === pokemon.name);
        if (updatedPlayerPoke && updatedPlayerPoke.fainted) {
          playPokemonCry(pokemon.name, 0.2);
        }

        await sleep(250);
        setAttacking(null);
        await sleep(150);
        setHitTarget(null);
        await sleep(300);

        if (data.battle_over) {
          setBattleOver(true);
          setWinner(data.winner);
        } else if (updatedPlayerPoke && updatedPlayerPoke.fainted) {
          const aliveRemaining = data.player_team.filter(p => !p.fainted);
          if (aliveRemaining.length > 0) {
            setSelectReason('faint');
            setSelectingPokemon(true);
          }
        }
      } catch (err) {
        console.error("Opponent first move execution error:", err);
      } finally {
        setAttacking(null);
        setHitTarget(null);
        setWaiting(false);
      }
    }
  };

  return (
    <Portal>
      <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && handleRequestClose()}>
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
              onClick={handleRequestClose}
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

          {/* Arena platform */}
          <ArenaBackground>
            <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', minWidth: '220px', backdropFilter: 'blur(8px)' }}>
              <HPBar current={opponentPokemon.current_hp} max={opponentPokemon.max_hp} label="Opponent" sublabel={opponentPokemon.name.charAt(0).toUpperCase() + opponentPokemon.name.slice(1)} />
            </div>

            <img
              src={opponentPokemon.sprite}
              alt={opponentPokemon.name}
              className={attacking === 'opponent' ? 'attack-opponent' : hitTarget === 'opponent' ? 'defender-hit' : ''
              }
              style={{ position: 'absolute', right: '120px', top: '80px', width: '160px', height: '160px', imageRendering: 'pixelated', filter: opponentPokemon.current_hp === 0 ? 'grayscale(1) opacity(0.3)' : 'drop-shadow(0 0 12px rgba(59,130,246,0.4))', transition: 'filter 0.5s ease' }}
            />

            <img
              src={playerPokemon.back_sprite || playerPokemon.sprite}
              alt={playerPokemon.name}
              className={attacking === 'player' ? 'attack-player' : hitTarget === 'player' ? 'defender-hit' : ''
              }
              style={{ position: 'absolute', left: '60px', bottom: '80px', width: '200px', height: '200px', imageRendering: 'pixelated', filter: playerPokemon.current_hp === 0 ? 'grayscale(1) opacity(0.3)' : 'drop-shadow(0 0 16px rgba(124,58,237,0.5))', transition: 'filter 0.5s ease' }}
            />

            <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', minWidth: '240px', backdropFilter: 'blur(8px)' }}>
              <HPBar current={playerPokemon.current_hp} max={playerPokemon.max_hp} label="Your Pokémon" sublabel={playerPokemon.name.charAt(0).toUpperCase() + playerPokemon.name.slice(1)} />
            </div>

            {!battleOver && (
              <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', background: waiting ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)', borderRadius: '20px', padding: '6px 18px', fontSize: '11px', fontWeight: 600, color: waiting ? 'var(--text-muted)' : '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.3s' }}>
                {waiting ? 'Opponents Turn...' : 'Your turn'}
              </div>
            )}
          </ArenaBackground>

          {/* Bottom section */}
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            padding: '20px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '16px' }}>
              <MoveSelector
                moves={playerPokemon.moves}
                onSelectMove={handleMove}
                disabled={waiting || battleOver || playerPokemon.current_hp === 0}
              />
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
        {/* Mid-Battle Leave Confirmation Modal */}
        <ConfirmModal
          open={showLeaveConfirm}
          onClose={() => setShowLeaveConfirm(false)}
          onConfirm={() => {
            setShowLeaveConfirm(false)
            onClose()
          }}
          title="Leave Battle?"
          message="Are you sure you want to forfeit and leave the battle mid-game? Your current match progress will be lost."
        />
      </div>
    </Portal>
  )
}

export default BattleArena