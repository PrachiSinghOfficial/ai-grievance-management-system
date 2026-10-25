import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './GrievanceDetail.css'

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
    attachment?: {
    filename: string
    content_type: string
    size: number
    url: string | null
  } | null
}

const statusSteps = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Awaiting Student',
  'Resolved',
  'Closed',
]

function GrievanceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [grievance, setGrievance] =
    useState<Grievance | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGrievance = async () => {
      const token =
        localStorage.getItem('access_token')

      if (!token) {
        navigate('/')
        return
      }

      try {
        const response = await fetch(
          '/api/grievances/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (response.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('student')
          navigate('/')
          return
        }

        if (!response.ok) {
          throw new Error(
            'Failed to load grievance'
          )
        }

        const data = await response.json()

        const selectedGrievance =
          data.grievances.find(
            (item: Grievance) =>
              item.id === id
          )

        if (!selectedGrievance) {
          setGrievance(null)
          return
        }

        setGrievance(selectedGrievance)

      } catch (error) {
        console.error(
          'Error loading grievance:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchGrievance()
  }, [id, navigate])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    )
  }

  const currentStepIndex = grievance
    ? statusSteps.indexOf(grievance.status)
    : 0

  if (loading) {
    return (
      <div className="grievance-detail-page">
        <div className="detail-loading">
          Loading grievance...
        </div>
      </div>
    )
  }

  if (!grievance) {
    return (
      <div className="grievance-detail-page">

        <div className="detail-not-found">

          <div className="detail-empty-icon">
            📋
          </div>

          <h2>
            Grievance not found
          </h2>

          <p>
            This grievance could not be found
            or may no longer be available.
          </p>

          <button
            onClick={() =>
              navigate('/my-grievances')
            }
          >
            Back to My Grievances
          </button>

        </div>

      </div>
    )
  }

  return (
    <div className="grievance-detail-page">

      <header className="detail-header">

        <button
          className="back-button"
          onClick={() =>
            navigate('/my-grievances')
          }
        >
          ← Back to My Grievances
        </button>

        <div className="detail-brand">
          🛡️ CampusResolve
        </div>

      </header>


      <main className="detail-container">

        <div className="detail-title-section">

          <div>

            <p className="detail-eyebrow">
              GRIEVANCE DETAILS
            </p>

            <h1>
              {grievance.title}
            </h1>

            <p className="detail-id">
              Grievance ID: {grievance.id}
            </p>

          </div>

          <span className="detail-status">
            {grievance.status}
          </span>

        </div>


        <section className="detail-card">

          <div className="detail-card-header">
            <h2>
              Grievance Information
            </h2>
          </div>
          
        {grievance.attachment && (
          <section className="detail-card">
            <div className="detail-card-header">
              <h2>Attached File</h2>
            </div>

            <p>
              {grievance.attachment.filename}
            </p>

            {grievance.attachment.url ? (
              grievance.attachment.content_type.startsWith('image/') ? (
                <a
                  href={grievance.attachment.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={grievance.attachment.url}
                    alt={grievance.attachment.filename}
                    style={{
                      display: 'block',
                      maxWidth: '100%',
                      maxHeight: '500px',
                      objectFit: 'contain',
                      borderRadius: '12px',
                      marginTop: '12px',
                    }}
                  />
                </a>
              ) : (
                <a
                  href={grievance.attachment.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open PDF attachment
                </a>
              )
            ) : (
              <p>Attachment is currently unavailable. Please refresh the page.</p>
            )}
          </section>
        )}


          <div className="detail-info-grid">

            <div className="detail-info-item">

              <span>Category</span>

              <strong>
                {grievance.category}
              </strong>

            </div>


            <div className="detail-info-item">

              <span>Priority</span>

              <strong>
                {grievance.priority}
              </strong>

            </div>


            <div className="detail-info-item">

              <span>Submitted</span>

              <strong>
                {formatDate(
                  grievance.created_at
                )}
              </strong>

            </div>


            <div className="detail-info-item">

              <span>Anonymous</span>

              <strong>
                {grievance.anonymous
                  ? 'Yes'
                  : 'No'}
              </strong>

            </div>

          </div>


          <div className="detail-description">

            <span>Description</span>

            <p>
              {grievance.description}
            </p>

          </div>

        </section>


        <section className="detail-card">

          <div className="detail-card-header">

            <div>
              <h2>
                Status Timeline
              </h2>

              <p>
                Track the progress of your grievance.
              </p>
            </div>

          </div>


          <div className="status-timeline">

            {statusSteps.map(
              (step, index) => {

                const completed =
                  index <= currentStepIndex

                const current =
                  index === currentStepIndex

                return (
                  <div
                    className={`timeline-item ${
                      completed
                        ? 'completed'
                        : ''
                    } ${
                      current
                        ? 'current'
                        : ''
                    }`}
                    key={step}
                  >

                    <div className="timeline-marker">

                      {completed
                        ? '✓'
                        : index + 1}

                    </div>

                    <div className="timeline-content">

                      <strong>
                        {step}
                      </strong>

                      {current && (
                        <span>
                          Current status
                        </span>
                      )}

                    </div>

                  </div>
                )
              }
            )}

          </div>

        </section>

      </main>

    </div>
  )
}

export default GrievanceDetail