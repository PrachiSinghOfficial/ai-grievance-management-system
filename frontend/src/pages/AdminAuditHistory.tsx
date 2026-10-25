
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type AuditLog = {
  id: string
  actor_name: string
  actor_email: string
  actor_role: string
  action: string
  target_type: string
  target_id: string | null
  details: Record<string, unknown>
  created_at: string | null
}

export default function AdminAuditHistory() {
  const navigate = useNavigate()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true)
        setError('')

        const token = localStorage.getItem('access_token')

        if (!token) {
          throw new Error('Login session not found. Please log in again.')
        }

        const response = await fetch(
          'http://127.0.0.1:8000/admin/audit-logs',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error(
              'Access denied. Please log in with an admin account.'
            )
          }

          throw new Error(
            `Could not load audit logs (HTTP ${response.status}).`
          )
        }

        const data = await response.json()

        setLogs(Array.isArray(data.logs) ? data.logs : [])
        setTotal(Number(data.total) || 0)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong while loading audit logs.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAuditLogs()
  }, [])

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  }

  const formatDate = (value: string | null) => {
    if (!value) return 'Date unavailable'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return 'Date unavailable'
    }

    return date.toLocaleString()
  }

  return (
    <div className="admin-page">
      <button
        className="admin-button admin-button-secondary"
        onClick={() => navigate('/admin')}
      >
        ← Back to Dashboard
      </button>

      <h1>🔐 Audit History</h1>

      <p className="admin-subtitle">
        Monitor administrative activities and system events.
      </p>

      <div className="admin-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Audit Records</p>
          <h2 className="admin-stat-value">
            {loading ? '…' : total}
          </h2>
          <p>Records currently returned by the backend.</p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Logging Status</p>
          <h2 style={{ fontSize: 22, marginTop: 12 }}>
            {loading ? 'Checking…' : error ? 'Connection issue' : 'Connected'}
          </h2>
          <p>
            {error
              ? 'Audit records could not be retrieved.'
              : 'Audit history API status.'}
          </p>
        </div>
      </div>

      <section className="admin-panel admin-section">
        <div className="admin-toolbar">
          <div>
            <h2 style={{ marginBottom: 4 }}>📋 Audit Logs</h2>
            <p style={{ margin: 0 }}>
              Latest administrative events recorded by the system.
            </p>
          </div>

          <span
            className={`admin-badge ${
              error ? 'admin-badge-warning' : 'admin-badge-success'
            }`}
          >
            {error ? 'Unavailable' : loading ? 'Loading' : 'API Connected'}
          </span>
        </div>

        {loading && (
          <div className="admin-empty-state">
            <h2>Loading audit records…</h2>
            <p>Please wait while the server responds.</p>
          </div>
        )}

        {!loading && error && (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">⚠️</div>
            <h2>Could Not Load Audit History</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">🔎</div>
            <h2>No Audit Records Yet</h2>
            <p>
              Records will appear after an admin, manager, or staff member
              performs an action that has audit logging enabled.
            </p>
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.created_at)}</td>

                    <td>
                      <strong>{log.actor_name || 'Unknown'}</strong>
                      <br />
                      <small>
                        {log.actor_email || 'Email unavailable'}
                      </small>
                      <br />
                      <span className="admin-badge">
                        {log.actor_role || 'unknown'}
                      </span>
                    </td>

                    <td>{formatAction(log.action || 'unknown')}</td>

                    <td>
                      <strong>{log.target_type || '—'}</strong>
                      <br />
                      <small>{log.target_id || 'ID unavailable'}</small>
                    </td>

                    <td>
                      {Object.keys(log.details || {}).length > 0 ? (
                        <pre
                          style={{
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'anywhere',
                            fontSize: 12,
                            margin: 0,
                          }}
                        >
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      ) : (
                        'No additional details'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
