import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MyGrievances.css'

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

function MyGrievances() {
  const navigate = useNavigate()

  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const token = localStorage.getItem('access_token')

        if (!token) {
          navigate('/')
          return
        }

        const response = await fetch(
          'http://127.0.0.1:8000/grievances/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail || 'Unable to load grievances.'
          )
        }

        setGrievances(data.grievances)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchGrievances()
  }, [navigate])

  return (
    <div className="my-grievances-page">

      <header className="my-grievances-header">

        <button
          className="back-button"
          onClick={() => navigate('/dashboard')}
        >
          ← Dashboard
        </button>

        <div className="page-brand">
          <div className="page-logo">
            🛡️
          </div>

          <div>
            <h2>CampusResolve</h2>
            <span>Student Portal</span>
          </div>
        </div>

      </header>

      <main className="my-grievances-main">

        <div className="page-intro">

          <p className="page-eyebrow">
            CAMPUS CARE / 03
          </p>

          <h1>
            My grievances
          </h1>

          <p>
            Track every concern you've submitted
            and follow its progress toward resolution.
          </p>

        </div>

        {loading && (
          <div className="grievance-message">
            Loading your grievances...
          </div>
        )}

        {error && (
          <div className="grievance-message error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          grievances.length === 0 && (

            <div className="empty-grievances">

              <div className="empty-grievance-icon">
                📋
              </div>

              <h2>
                No grievances yet
              </h2>

              <p>
                You haven't submitted any grievances.
              </p>

              <button
                onClick={() =>
                  navigate('/submit-grievance')
                }
              >
                Submit a grievance →
              </button>

            </div>
          )}

        {!loading &&
          !error &&
          grievances.length > 0 && (

            <section className="grievance-list">

              <div className="list-header">

                <div>
                  <h2>
                    Your submissions
                  </h2>

                  <p>
                    {grievances.length}{' '}
                    {grievances.length === 1
                      ? 'grievance'
                      : 'grievances'}
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate('/submit-grievance')
                  }
                >
                  + New grievance
                </button>

              </div>

              {grievances.map((grievance) => (

                <article
                  className="grievance-item"
                  key={grievance.id}
                  onClick={() =>
                    navigate(`/grievance/${grievance.id}`)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' ||
                      event.key === ' '
                    ) {
                      navigate(
                        `/grievance/${grievance.id}`
                      )
                    }
                  }}
                >

                  <div className="grievance-item-main">

                    <div className="grievance-icon">
                      📋
                    </div>

                    <div>

                      <h3>
                        {grievance.title}
                      </h3>

                      <div className="grievance-meta">

                        <span>
                          {grievance.category}
                        </span>

                        <span>•</span>

                        <span>
                          {new Date(
                            grievance.created_at
                          ).toLocaleDateString()}
                        </span>

                        {grievance.anonymous && (
                          <>
                            <span>•</span>

                            <span>
                              Anonymous
                            </span>
                          </>
                        )}

                      </div>

                    </div>

                  </div>

                  <div className="grievance-item-right">

                    <span
                      className={`status-badge ${grievance.status
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {grievance.status}
                    </span>

                    <span className="priority-text">
                      {grievance.priority}
                    </span>

                  </div>

                </article>

              ))}

            </section>
          )}

      </main>

    </div>
  )
}

export default MyGrievances