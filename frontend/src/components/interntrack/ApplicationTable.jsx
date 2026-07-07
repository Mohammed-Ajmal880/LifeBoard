import { useState } from 'react'

const STATUS_COLOURS = {
  applied:   { bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.4)',  color: '#60a5fa' },
  interview: { bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.4)',  color: '#fb923c' },
  offer:     { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.4)',   color: '#4ade80' },
  rejected:  { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.4)',   color: '#f87171' },
}

function StatusBadge({ status, hovered }) {
  const colours = hovered
    ? STATUS_COLOURS[status]
    : { bg: 'rgba(100,100,130,0.25)', border: 'rgba(120,120,150,0.3)', color: '#888899' }

  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          '5px',
      padding:      '3px 10px',
      borderRadius: '20px',
      fontSize:     '11px',
      fontWeight:   600,
      background:   colours.bg,
      border:       `1px solid ${colours.border}`,
      color:        colours.color,
      transition:   'all 0.25s',
      whiteSpace:   'nowrap',
    }}>
      <span style={{
        width:        '5px',
        height:       '5px',
        borderRadius: '50%',
        background:   colours.color,
        display:      'inline-block',
      }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function ApplicationTable({ applications, cvVersions, onEdit, onDelete }) {
  const getCV = (id) => cvVersions.find(cv => cv.id === id)

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th>CV used</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No applications yet — add your first one!
              </td>
            </tr>
          ) : (
            applications.map((app) => {
              const cv = getCV(app.cv_version_id)
              return (
                <TableRow
                  key={app.id}
                  app={app}
                  cv={cv}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

function TableRow({ app, cv, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="td-primary">{app.company}</td>
      <td>{app.role}</td>
      <td className="td-mono">{cv ? cv.label : '—'}</td>
      <td className="td-mono">{app.applied_date}</td>
      <td>
        <StatusBadge status={app.status} hovered={hovered} />
      </td>
      <td>
        <div className="td-actions">
          <button
            className="action-btn"
            onClick={() => onEdit(app)}
            title="Update"
          >
            ✏ Update
          </button>
          <button
            className="action-btn danger"
            onClick={() => onDelete(app.id)}
            title="Delete"
          >
            🗑 Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

export default ApplicationTable