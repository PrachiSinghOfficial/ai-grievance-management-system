import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

interface Stats {
  total: number
  in_progress: number
  resolved: number
  awaiting_response: number
}

interface Grievance {
  id: string
  title: string
  category: string
  description: string
  anonymous: boolean
  status: string
  priority: string
  created_at: string
  updated_at: string
}

function Dashboard() {
  const navigate = useNavigate()

  const [activeNav, setActiveNav] = useState('Dashboard')

  const [stats, setStats] = useState<Stats>({
    total: 0,
    in_progress: 0,
    resolved: 0,
    awaiting_response: 0,
  })

  const [grievances, setGrievances] = useState<Grievance[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('access_token')

      if (!token) {
        navigate('/')
        return
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        }

        const [statsResponse, grievancesResponse] =
          await Promise.all([
            fetch(
              '/api/grievances/stats',
              { headers }
            ),

            fetch(
              '/api/grievances/me',
              { headers }
            ),
          ])

        if (
          statsResponse.status === 401 ||
          grievancesResponse.status === 401
        ) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('student')
          navigate('/')
          return
        }

        if (!statsResponse.ok || !grievancesResponse.ok) {
          throw new Error('Failed to load dashboard data')
        }

        const statsData = await statsResponse.json()
        const grievancesData = await grievancesResponse.json()

        setStats(statsData)
        setGrievances(
          grievancesData.grievances.slice(0, 3)
        )

      } catch (error) {
        console.error(
          'Error loading dashboard:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [navigate])

  const student = JSON.parse(
    localStorage.getItem('student') || '{}'
  )

  const studentName = student.name || 'Student'

  const handleNavigation = (item: string) => {
    setActiveNav(item)

    if (item === 'Dashboard') {
      navigate('/dashboard')
      return
    }

    if (item === 'Submit Grievance') {
      navigate('/submit-grievance')
      return
    }

    if (item === 'My Grievances') {
      navigate('/my-grievances')
      return
    }
    if (item === 'Notifications') {
  navigate('/student/notifications')
  return
}
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('student')
    navigate('/')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  return (
    <div className="dashboard-page">

      <aside className="dashboard-sidebar">

        <div className="dashboard-brand">

          <div className="dashboard-logo">
            🛡️
          </div>

          <div>
            <h2>CampusResolve</h2>
            <span>Student Portal</span>
          </div>

        </div>

        <nav className="dashboard-nav">

          {[
            'Dashboard',
            'My Grievances',
            'Submit Grievance',
            'Notifications',
          ].map((item) => (

            <button
              key={item}
              className={
                activeNav === item
                  ? 'active'
                  : ''
              }
              onClick={() =>
                handleNavigation(item)
              }
            >

              <span>
                {item === 'Dashboard' && '⌂'}
                {item === 'My Grievances' && '☷'}
                {item === 'Submit Grievance' && '＋'}
                {item === 'Notifications' && '🔔'}
              </span>

              {item}

            </button>

          ))}

        </nav>

        <div className="sidebar-bottom">

          <button
            className="profile-button"
            onClick={() =>
              setActiveNav('Profile')
            }
          >
            <span>👤</span>
            Profile
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Sign out
          </button>

        </div>

      </aside>


      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>

            <p className="dashboard-eyebrow">
              STUDENT WORKSPACE
            </p>

            <h1>
              Hello, {studentName} 👋
            </h1>

            <p>
              Here's an overview of your grievance activity.
            </p>

          </div>

          <div className="header-profile">

            <div className="notification-icon">
              🔔
            </div>

            <div className="avatar">
              {studentName
                .split(' ')
                .map((word: string) => word[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>

          </div>

        </header>


        <section className="dashboard-hero">

          <div>

            <span className="hero-label">
              NEED HELP?
            </span>

            <h2>
              Have a concern on campus?
            </h2>

            <p>
              Submit your grievance and track
              its progress from one place.
            </p>

          </div>

          <button
            className="primary-action"
            onClick={() =>
              navigate('/submit-grievance')
            }
          >
            Submit a grievance
            <span>→</span>
          </button>

        </section>


        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon blue">
              📋
            </div>

            <div>

              <span>
                Total grievances
              </span>

              <strong>
                {loading ? '...' : stats.total}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon orange">
              ◷
            </div>

            <div>

              <span>
                In progress
              </span>

              <strong>
                {loading
                  ? '...'
                  : stats.in_progress}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>

              <span>
                Resolved
              </span>

              <strong>
                {loading
                  ? '...'
                  : stats.resolved}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon red">
              !
            </div>

            <div>

              <span>
                Awaiting response
              </span>

              <strong>
                {loading
                  ? '...'
                  : stats.awaiting_response}
              </strong>

            </div>

          </div>

        </section>


        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                Recent grievances
              </h2>

              <p>
                Your latest submitted concerns.
              </p>

            </div>

            <button
              onClick={() =>
                navigate('/my-grievances')
              }
            >
              View all →
            </button>

          </div>


          {loading ? (

            <div className="empty-state">

              <div className="empty-icon">
                ⏳
              </div>

              <h3>
                Loading grievances...
              </h3>

              <p>
                Please wait while we load your latest
                grievance activity.
              </p>

            </div>

          ) : grievances.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                📋
              </div>

              <h3>
                No grievances yet
              </h3>

              <p>
                You haven't submitted any grievances.
                When you do, they'll appear here.
              </p>

              <button
                className="empty-action"
                onClick={() =>
                  navigate('/submit-grievance')
                }
              >
                Submit your first grievance
              </button>

            </div>

          ) : (

            <div className="recent-grievances-list">

              {grievances.map((grievance) => (

                <div
                  className="recent-grievance-card"
                  key={grievance.id}
                >

                  <div className="recent-grievance-main">

                    <div className="recent-grievance-icon">
                      📋
                    </div>

                    <div>

                      <h3>
                        {grievance.title}
                      </h3>

                      <p>
                        {grievance.category}
                        {' • '}
                        {formatDate(
                          grievance.created_at
                        )}
                      </p>

                    </div>

                  </div>


                  <div className="recent-grievance-meta">

                    <span
                      className="grievance-status"
                    >
                      {grievance.status}
                    </span>

                    <span
                      className="grievance-priority"
                    >
                      {grievance.priority}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  )
}

export default Dashboard