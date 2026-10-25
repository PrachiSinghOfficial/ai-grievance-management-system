import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ManagerDashboard.css'

interface ManagerStats {
  total: number
  open: number
  resolved: number
  closed: number
}

function ManagerDashboard() {
  const navigate = useNavigate()

  const [stats, setStats] = useState<ManagerStats>({
    total: 0,
    open: 0,
    resolved: 0,
    closed: 0,
  })

  const [managerName, setManagerName] = useState('Manager')
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
        setManagerName(user.name || 'Manager')
      } catch {
        setManagerName('Manager')
      }
    }

    fetch('http://127.0.0.1:8000/manager/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            'Unable to load manager dashboard.'
          )
        }

        return response.json()
      })
      .then((data) => {
        setStats({
          total: data.stats?.total ?? 0,
          open: data.stats?.open ?? 0,
          resolved: data.stats?.resolved ?? 0,
          closed: data.stats?.closed ?? 0,
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
    <div className="manager-dashboard">

      {/* SIDEBAR */}
      <aside className="manager-sidebar">

        <div className="manager-brand">
          <div className="manager-brand-icon">
            CR
          </div>

          <div>
            <h2>CampusResolve</h2>
            <span>Manager Portal</span>
          </div>
        </div>

        <nav className="manager-nav">

          <button
            className="manager-nav-item active"
            onClick={() => navigate('/manager/dashboard')}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="manager-nav-item"
            onClick={() =>
              navigate('/manager/grievances')
            }
          >
            <span>◫</span>
            Grievances
          </button>

          <button
            className="manager-nav-item"
            onClick={() =>
              navigate('/manager/escalations')
            }
          >
            <span>⚑</span>
            Escalations
          </button>

          <button
            className="manager-nav-item"
            onClick={() =>
              navigate('/manager/sla')
            }
          >
            <span>◷</span>
            SLA Monitoring
          </button>

          <button
            className="manager-nav-item"
            onClick={() =>
              navigate('/manager/reports')
            }
          >
            <span>▤</span>
            Reports
          </button>

        </nav>

        <div className="manager-sidebar-bottom">

          <button
            className="manager-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="manager-main">

        {/* HEADER */}
        <header className="manager-header">

          <div>

            <p className="manager-eyebrow">
              MANAGER PORTAL
            </p>

            <h1>
              Good to see you, {managerName} 👋
            </h1>

            <p>
              Monitor grievance queues, escalations
              and resolution progress.
            </p>

          </div>

          <div className="manager-profile">

            <div className="manager-avatar">
              {managerName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{managerName}</strong>
              <span>Manager</span>
            </div>

          </div>

        </header>

        {/* ERROR */}
        {error && (
          <div className="manager-error">
            {error}
          </div>
        )}

        {/* STATISTICS */}
        <section className="manager-stats">

          <div className="manager-stat-card">

            <div className="manager-stat-icon">
              ▦
            </div>

            <div>
              <span>Total Grievances</span>

              <strong>
                {loading ? '—' : stats.total}
              </strong>
            </div>

          </div>

          <div className="manager-stat-card">

            <div className="manager-stat-icon">
              ◷
            </div>

            <div>
              <span>Open Cases</span>

              <strong>
                {loading ? '—' : stats.open}
              </strong>
            </div>

          </div>

          <div className="manager-stat-card">

            <div className="manager-stat-icon">
              ✓
            </div>

            <div>
              <span>Resolved</span>

              <strong>
                {loading ? '—' : stats.resolved}
              </strong>
            </div>

          </div>

          <div className="manager-stat-card">

            <div className="manager-stat-icon">
              □
            </div>

            <div>
              <span>Closed</span>

              <strong>
                {loading ? '—' : stats.closed}
              </strong>
            </div>

          </div>

        </section>

        {/* MAIN GRID */}
        <section className="manager-content-grid">

          {/* OPERATIONS */}
          <div className="manager-panel">

            <div className="manager-panel-header">

              <div>

                <p className="manager-section-label">
                  MANAGEMENT
                </p>

                <h2>
                  Manager Operations
                </h2>

              </div>

            </div>

            <div className="manager-action-grid">

              {/* GRIEVANCES */}
              <button
                className="manager-action-card"
                onClick={() =>
                  navigate('/manager/grievances')
                }
              >

                <span className="action-icon">
                  ◫
                </span>

                <div>

                  <strong>
                    Grievance Queue
                  </strong>

                  <p>
                    Review and monitor active
                    grievances.
                  </p>

                </div>

                <span className="action-arrow">
                  →
                </span>

              </button>

              {/* ESCALATIONS */}
              <button
                className="manager-action-card"
                onClick={() =>
                  navigate('/manager/escalations')
                }
              >

                <span className="action-icon">
                  ⚑
                </span>

                <div>

                  <strong>
                    Escalations
                  </strong>

                  <p>
                    Monitor cases requiring
                    higher-level attention.
                  </p>

                </div>

                <span className="action-arrow">
                  →
                </span>

              </button>

              {/* SLA */}
              <button
                className="manager-action-card"
                onClick={() =>
                  navigate('/manager/sla')
                }
              >

                <span className="action-icon">
                  ◷
                </span>

                <div>

                  <strong>
                    SLA Monitoring
                  </strong>

                  <p>
                    Track cases approaching their
                    resolution deadline.
                  </p>

                </div>

                <span className="action-arrow">
                  →
                </span>

              </button>

              {/* REPORTS */}
              <button
                className="manager-action-card"
                onClick={() =>
                  navigate('/manager/reports')
                }
              >

                <span className="action-icon">
                  ▤
                </span>

                <div>

                  <strong>
                    Reports & Analytics
                  </strong>

                  <p>
                    View department performance
                    and trends.
                  </p>

                </div>

                <span className="action-arrow">
                  →
                </span>

              </button>

            </div>

          </div>

          {/* SYSTEM STATUS */}
          <div className="manager-panel manager-status-panel">

            <div>

              <p className="manager-section-label">
                SYSTEM STATUS
              </p>

              <h2>
                Platform Overview
              </h2>

            </div>

            <div className="manager-status-row">

              <span>
                Grievance Management
              </span>

              <span className="status-badge operational">
                Operational
              </span>

            </div>

            <div className="manager-status-row">

              <span>
                Role Management
              </span>

              <span className="status-badge operational">
                Operational
              </span>

            </div>

            <div className="manager-status-row">

              <span>
                AI Assistance
              </span>

              <span className="status-badge planned">
                In Development
              </span>

            </div>

            <div className="manager-status-row">

              <span>
                SLA Automation
              </span>

              <span className="status-badge planned">
                In Development
              </span>

            </div>

          </div>

        </section>

        {/* DEVELOPMENT PHASE */}
        <section className="manager-phase">

          <div className="phase-number">
            02
          </div>

          <div>

            <span>
              CURRENT DEVELOPMENT PHASE
            </span>

            <h2>
              Manager Operations &
              Grievance Oversight
            </h2>

            <p>
              Manager-level monitoring,
              escalation handling, SLA
              monitoring and operational
              controls are being integrated
              into CampusResolve.
            </p>

          </div>

        </section>

      </main>

    </div>
  )
}

export default ManagerDashboard