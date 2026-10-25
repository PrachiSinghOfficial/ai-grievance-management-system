import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './StaffDashboard.css'

interface StaffStats {
  total: number
  open: number
  resolved: number
  priority: number
}

function StaffDashboard() {
  const navigate = useNavigate()

  const [stats, setStats] = useState<StaffStats>({
    total: 0,
    open: 0,
    resolved: 0,
    priority: 0,
  })

  const [staffName, setStaffName] = useState('Staff')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('student')

    if (!token) {
      navigate('/')
      return
    }

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setStaffName(user.name || 'Staff')
      } catch {
        setStaffName('Staff')
      }
    }

    fetch('/api/staff/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to load staff dashboard.')
        }

        return response.json()
      })
      .then((data) => {
        setStats({
          total: data.stats?.total ?? 0,
          open: data.stats?.open ?? 0,
          resolved: data.stats?.resolved ?? 0,
          priority: data.stats?.priority ?? 0,
        })
      })
      .catch((err) => {
        setError(
          err.message || 'Something went wrong.'
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('student')
    navigate('/')
  }

  return (
    <div className="staff-dashboard">

      <aside className="staff-sidebar">

        <div className="staff-brand">
          <div className="staff-brand-icon">
            CR
          </div>

          <div>
            <h2>CampusResolve</h2>
            <span>Staff Portal</span>
          </div>
        </div>

        <nav className="staff-nav">

          <button className="staff-nav-item active">
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="staff-nav-item"
            onClick={() =>
              navigate('/staff/grievances')
            }
          >
            <span>◫</span>
            Grievance Queue
          </button>

          <button className="staff-nav-item">
            <span>⚑</span>
            Assigned Cases
          </button>

          <button className="staff-nav-item">
            <span>◷</span>
            SLA Monitoring
          </button>

        </nav>

        <div className="staff-sidebar-bottom">

          <button
            className="staff-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      <main className="staff-main">

        <header className="staff-header">

          <div>
            <p className="staff-eyebrow">
              STAFF PORTAL
            </p>

            <h1>
              Good to see you, {staffName} 👋
            </h1>

            <p>
              Manage assigned grievances and support
              timely resolution.
            </p>
          </div>

          <div className="staff-profile">

            <div className="staff-avatar">
              {staffName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>{staffName}</strong>
              <span>Staff Member</span>
            </div>

          </div>

        </header>

        {error && (
          <div className="staff-error">
            {error}
          </div>
        )}

        <section className="staff-stats">

          <div className="staff-stat-card">

            <div className="staff-stat-icon">
              ▦
            </div>

            <div>
              <span>Total Cases</span>

              <strong>
                {loading ? '—' : stats.total}
              </strong>
            </div>

          </div>

          <div className="staff-stat-card">

            <div className="staff-stat-icon">
              ◷
            </div>

            <div>
              <span>Open Cases</span>

              <strong>
                {loading ? '—' : stats.open}
              </strong>
            </div>

          </div>

          <div className="staff-stat-card">

            <div className="staff-stat-icon">
              ✓
            </div>

            <div>
              <span>Resolved</span>

              <strong>
                {loading ? '—' : stats.resolved}
              </strong>
            </div>

          </div>

          <div className="staff-stat-card">

            <div className="staff-stat-icon">
              !
            </div>

            <div>
              <span>Priority Cases</span>

              <strong>
                {loading ? '—' : stats.priority}
              </strong>
            </div>

          </div>

        </section>

        <section className="staff-content-grid">

          <div className="staff-panel">

            <div className="staff-panel-header">

              <div>
                <p className="staff-section-label">
                  OPERATIONS
                </p>

                <h2>
                  Staff Workspace
                </h2>
              </div>

            </div>

            <div className="staff-action-grid">

              <button
                className="staff-action-card"
                onClick={() =>
                  navigate('/staff/grievances')
                }
              >

                <span className="staff-action-icon">
                  ◫
                </span>

                <div>
                  <strong>
                    Grievance Queue
                  </strong>

                  <p>
                    Review and process grievance cases.
                  </p>
                </div>

                <span className="staff-action-arrow">
                  →
                </span>

              </button>

              <button className="staff-action-card">

                <span className="staff-action-icon">
                  ⚑
                </span>

                <div>
                  <strong>
                    Assigned Cases
                  </strong>

                  <p>
                    View cases assigned to you.
                  </p>
                </div>

                <span className="staff-action-arrow">
                  →
                </span>

              </button>

              <button className="staff-action-card">

                <span className="staff-action-icon">
                  ◷
                </span>

                <div>
                  <strong>
                    SLA Monitoring
                  </strong>

                  <p>
                    Identify cases approaching deadlines.
                  </p>
                </div>

                <span className="staff-action-arrow">
                  →
                </span>

              </button>

            </div>

          </div>

          <div className="staff-panel staff-status-panel">

            <div>

              <p className="staff-section-label">
                WORKFLOW
              </p>

              <h2>
                Case Handling
              </h2>

            </div>

            <div className="staff-status-row">

              <span>
                New Grievances
              </span>

              <span className="staff-status-badge">
                Ready
              </span>

            </div>

            <div className="staff-status-row">

              <span>
                Case Review
              </span>

              <span className="staff-status-badge">
                Ready
              </span>

            </div>

            <div className="staff-status-row">

              <span>
                Status Updates
              </span>

              <span className="staff-status-badge">
                Ready
              </span>

            </div>

            <div className="staff-status-row">

              <span>
                AI Assistance
              </span>

              <span className="staff-planned-badge">
                Planned
              </span>

            </div>

          </div>

        </section>

        <section className="staff-phase">

          <div className="staff-phase-number">
            03
          </div>

          <div>

            <span>
              CURRENT DEVELOPMENT PHASE
            </span>

            <h2>
              Staff Operations & Case Processing
            </h2>

            <p>
              Staff-level grievance review, assignment,
              status management and operational controls
              are being implemented.
            </p>

          </div>

        </section>

      </main>

    </div>
  )
}

export default StaffDashboard