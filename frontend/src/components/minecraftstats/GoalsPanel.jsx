import { useState } from 'react'
import GoalModal from './GoalModal'
import api from '../../services/api'
import ConfirmModal from '../common/ConfirmModal'

function GoalsPanel({ goals, onRefresh }) {
  const [modalOpen,    setModalOpen]    = useState(false)
  const [editingGoal,  setEditingGoal]  = useState(null)
  const [confirmOpen, setConfirmOpen]   = useState(false)
  const [deletingId,  setDeletingId]    = useState(null)

  const handleSave = async (payload) => {
    try {
      if (editingGoal) {
        await api.patch(`/goals/${editingGoal.id}`, payload)
      } else {
        await api.post('/goals/', payload)
      }
      setModalOpen(false)
      setEditingGoal(null)
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggle = async (goal) => {
    try {
      await api.patch(`/goals/${goal.id}`, { completed: !goal.completed })
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = (id) => {
    setDeletingId(id)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`/goals/${deletingId}`)
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (goal) => {
    setEditingGoal(goal)
    setModalOpen(true)
  }

  return (
    <div style={{
      position: 'relative',
      background:    'var(--side-panel-bg)',
      border:        '1px solid var(--glass-border-strong, rgba(255, 255, 255, 0.08))',
      borderRadius:  'var(--radius)',
      padding:       '18px',
      backdropFilter:'blur(20px)',
      height:        'fit-content',
    }}>

      {/* ✨ GLOW 2: Cyan circle anchored directly at the top right corner */}
      <div style={{
        position: 'absolute',
        top: '-60px',
        right: '-80px',         
        width: '280px',
        height: '280px',
        background: 'radial-gradient(circle, #3b82f6 1%, rgba(6, 182, 212, 0.02) 50%, transparent 100%)',
        filter: 'blur(55px)',
        pointerEvents: 'none',   
        zIndex: 0,
      }} />

      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   '16px',
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>
          Long-term goals
        </h3>
        <button
          className="btn-gradient"
          onClick={() => { setEditingGoal(null); setModalOpen(true) }}
          style={{ padding: '5px 12px', fontSize: '12px' }}
        >
          + Add
        </button>
      </div>

      {/* Empty state */}
      {goals.length === 0 && (
        <p style={{
          fontSize:  '12px',
          color:     'var(--text-muted)',
          textAlign: 'center',
          padding:   '20px 0',
        }}>
          No goals yet — add one to get started!
        </p>
      )}

      {/* Goal rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {goals.map(goal => (
          <div key={goal.id} style={{
            display:    'flex',
            alignItems: 'flex-start',
            gap:        '10px',
            padding:    '10px 12px',
            background: 'rgba(255,255,255,0.04)',
            border:     '1px solid rgba(255,255,255,0.06)',
            borderRadius:'var(--radius-sm)',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
          >
            {/* Circle toggle */}
            <button
              onClick={() => handleToggle(goal)}
              style={{
                width:        '18px',
                height:       '18px',
                borderRadius: '50%',
                border:       goal.completed
                  ? 'none'
                  : '2px solid var(--accent-purple)',
                background:   goal.completed
                  ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))'
                  : 'transparent',
                cursor:       'pointer',
                flexShrink:   0,
                marginTop:    '1px',
                display:      'flex',
                alignItems:   'center',
                justifyContent:'center',
                fontSize:     '10px',
                color:        '#fff',
                transition:   'all 0.2s',
              }}
            >
              {goal.completed ? '✓' : ''}
            </button>

            {/* Title */}
            <p style={{
              flex:           1,
              fontSize:       '13px',
              color:          goal.completed ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: goal.completed ? 'line-through' : 'none',
              lineHeight:     1.4,
              transition:     'all 0.2s',
            }}>
              {goal.title}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
              <button
                className="action-btn"
                onClick={() => handleEdit(goal)}
                title="Edit"
              >✏</button>
              <button
                className="action-btn danger"
                onClick={() => handleDelete(goal.id)}
                title="Delete"
              >🗑</button>
            </div>
          </div>
        ))}
      </div>

      <GoalModal
        key={editingGoal?.id || 'new'}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingGoal(null) }}
        onSave={handleSave}
        goal={editingGoal}
      />
      <ConfirmModal
      open={confirmOpen}
  onClose={() => { setConfirmOpen(false); setDeletingId(null) }}
  onConfirm={confirmDelete}
  title="Delete Goal?"
  message="This goal will be permanently deleted."
/>
    </div>
  )
}

export default GoalsPanel