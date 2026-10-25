
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://127.0.0.1:8000'

type DashboardReport = {
  admin?: {
    name?: string
    email?: string
    role?: string
  }
  users?: {
    total?: number
    students?: number
    staff?: number
    managers?: number
    admins?: number
  }
  grievances?: {
    total?: number
    open?: number
    resolved?: number
    closed?: number
  }
}

export default function AdminReports() {
  const navigate = useNavigate()
  const [report, setReport] = useState<DashboardReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadReports() {
      try {
        const token = localStorage.getItem('access_token')

        if (!token) {
          throw new Error('Login session not found. Please log in again.')
        }

        const response = await fetch(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error(`Unable to load reports (${response.status}).`)
        }

        setReport(await response.json())
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load reports.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  const users = report?.users
  const grievances = report?.grievances

  const summaryCards = [
    {
      label: 'Total Grievances',
      value: grievances?.total ?? 0,
      icon: '📋',
    },
    {
      label: 'Open Grievances',
      value: grievances?.open ?? 0,
      icon: '⏳',
    },
    {
      label: 'Resolved Grievances',
      value: grievances?.resolved ?? 0,
      icon: '✅',
    },
    {
      label: 'Closed Grievances',
      value: grievances?.closed ?? 0,
      icon: '📁',
    },
    {
      label: 'Total Users',
      value: users?.total ?? 0,
      icon: '👥',
    },
  ]

  const userRoles = [
    { label: 'Students', value: users?.students ?? 0 },
    { label: 'Staff', value: users?.staff ?? 0 },
    { label: 'Managers', value: users?.managers ?? 0 },
    { label: 'Administrators', value: users?.admins ?? 0 },
  ]

  const grievanceStatuses = [
    { label: 'Open', value: grievances?.open ?? 0 },
    { label: 'Resolved', value: grievances?.resolved ?? 0 },
    { label: 'Closed', value: grievances?.closed ?? 0 },
  ]

  function renderBreakdown(
    items: { label: string; value: number }[],
    total: number,
    color: string
  ) {
    return items.map((item) => {
      const percentage =
        total > 0 ? Math.min((item.value / total) * 100, 100) : 0

      return (
        <div key={item.label} style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 8,
            }}
          >
            <span>{item.label}</span>
            <strong>
              {item.value}
              <span style={{ color: '#64748b', fontWeight: 400 }}>
                {' '}({Math.round(percentage)}%)
              </span>
            </strong>
          </div>

          <div className="admin-progress-track">
            <div
              className="admin-progress-fill"
              style={{
                width: `${percentage}%`,
                background: color,
              }}
            />
          </div>
        </div>
      )
    })
  }

  return (
    <div className="admin-page">
      <button
        className="admin-button admin-button-secondary"
        onClick={() => navigate('/admin')}
      >
        ← Back to Dashboard
      </button>

      <h1>📊 Reports & Analytics</h1>
      <p className="admin-subtitle">
        Overview of registered users and grievance activity.
      </p>

      {loading && (
        <div className="admin-panel">
          <p>Loading reports...</p>
        </div>
      )}

      {error && (
        <div className="admin-alert-error">
          <strong>Unable to load reports</strong>
          <p>{error}</p>
          <button
            className="admin-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && report && (
        <>
          <div className="admin-toolbar">
            <div>
              <h2 style={{ marginBottom: 4 }}>System Overview</h2>
              <p style={{ margin: 0 }}>
                Current dashboard data for{' '}
                <strong>{report.admin?.name ?? 'Administrator'}</strong>
              </p>
            </div>

            <span className="admin-badge admin-badge-success">
              Live dashboard data
            </span>
          </div>

          <div className="admin-grid">
            {summaryCards.map((item) => (
              <div className="admin-stat-card" key={item.label}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <p className="admin-stat-label">{item.label}</p>
                  <span style={{ fontSize: 24 }}>{item.icon}</span>
                </div>

                <h2 className="admin-stat-value">{item.value}</h2>
              </div>
            ))}
          </div>

          <div className="admin-report-layout admin-section">
            <section className="admin-report-card">
              <h2>👥 User Role Breakdown</h2>
              <p>Distribution of registered accounts by role.</p>

              {renderBreakdown(
                userRoles,
                users?.total ?? 0,
                '#2563eb'
              )}

              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <strong>Total Users</strong>
                <strong>{users?.total ?? 0}</strong>
              </div>
            </section>

            <section className="admin-report-card">
              <h2>📋 Grievance Status Breakdown</h2>
              <p>Current distribution of grievance statuses.</p>

              {renderBreakdown(
                grievanceStatuses,
                grievances?.total ?? 0,
                '#0d9488'
              )}

              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <strong>Total Grievances</strong>
                <strong>{grievances?.total ?? 0}</strong>
              </div>

              <p style={{ fontSize: 12, marginTop: 14 }}>
                Other statuses, if any, may not be included in this breakdown.
              </p>
            </section>
          </div>

          <section className="admin-panel admin-section">
            <h2>Report Information</h2>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <tbody>
                  <tr>
                    <th>Administrator</th>
                    <td>{report.admin?.name ?? 'Not available'}</td>
                  </tr>
                  <tr>
                    <th>Account Email</th>
                    <td>{report.admin?.email ?? 'Not available'}</td>
                  </tr>
                  <tr>
                    <th>Role</th>
                    <td>
                      <span className="admin-badge">
                        {report.admin?.role ?? 'admin'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>Data Source</th>
                    <td>Admin Dashboard API</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
