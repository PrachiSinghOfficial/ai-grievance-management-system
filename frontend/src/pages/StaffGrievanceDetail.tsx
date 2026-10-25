import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface Grievance {
  id: string
  title: string
  category: string
  description: string
  status: string
  priority: string
  anonymous: boolean
  created_at?: string
  student_id?: string
}

const statuses = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Awaiting Student',
  'Resolved',
  'Closed',
  'Reopened',
  'Rejected',
]

const priorities = [
  'Low',
  'Normal',
  'High',
  'Critical',
]

function StaffGrievanceDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [grievance, setGrievance] =
    useState<Grievance | null>(null)

  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      navigate('/')
      return
    }

    if (!id) {
      setError('Invalid grievance ID.')
      setLoading(false)
      return
    }

    fetch(
      `http://127.0.0.1:8000/admin/grievances/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))

          throw new Error(
            data.detail ||
              'Unable to load grievance.'
          )
        }

        return response.json()
      })
      .then((data) => {
        const item = data.grievance || data

        setGrievance(item)
        setStatus(item.status || 'Submitted')
        setPriority(item.priority || 'Normal')
      })
      .catch((err) => {
        setError(
          err.message ||
            'Something went wrong.'
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, navigate])

  const handleSave = async () => {
    const token = localStorage.getItem(
      'access_token'
    )

    if (!token || !id) {
      return
    }

    setSaving(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/admin/grievances/${id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            priority,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            'Unable to update grievance.'
        )
      }

      setGrievance((previous) =>
        previous
          ? {
              ...previous,
              status,
              priority,
            }
          : previous
      )

      setMessage(
        'Grievance updated successfully.'
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update grievance.'
      )
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return '—'

    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) {
      return '—'
    }

    return parsed.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('student')
    navigate('/')
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f5f7fb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
        }}
      >
        Loading grievance...
      </div>
    )
  }

  if (error && !grievance) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f5f7fb',
          padding: '40px',
        }}
      >
        <button
          onClick={() =>
            navigate('/staff/grievances')
          }
          style={{
            border: 'none',
            background: 'transparent',
            color: '#2563eb',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          ← Back to Queue
        </button>

        <div
          style={{
            background: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            padding: '16px',
            borderRadius: '10px',
          }}
        >
          {error}
        </div>
      </div>
    )
  }

  if (!grievance) {
    return null
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        color: '#172033',
      }}
    >
      <header
        style={{
          background: '#111827',
          color: 'white',
          padding: '18px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 800,
            }}
          >
            CampusResolve
          </div>

          <div
            style={{
              color: '#94a3b8',
              fontSize: '11px',
              marginTop: '3px',
            }}
          >
            Staff Portal · Case Review
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
          }}
        >
          <button
            onClick={() =>
              navigate('/staff/grievances')
            }
            style={{
              border: '1px solid #334155',
              background: 'transparent',
              color: '#e2e8f0',
              padding: '8px 13px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            ← Queue
          </button>

          <button
            onClick={handleLogout}
            style={{
              border: 'none',
              background: '#dc2626',
              color: 'white',
              padding: '8px 13px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: '1150px',
          margin: '0 auto',
          padding: '32px',
        }}
      >
        <div
          style={{
            marginBottom: '25px',
          }}
        >
          <div
            style={{
              color: '#2563eb',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1px',
              marginBottom: '7px',
            }}
          >
            CASE REVIEW
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '27px',
              letterSpacing: '-0.6px',
            }}
          >
            {grievance.title}
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: '12px',
              marginTop: '8px',
            }}
          >
            Case ID: {grievance.id}
          </p>
        </div>

        {message && (
          <div
            style={{
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              padding: '12px 15px',
              borderRadius: '9px',
              marginBottom: '18px',
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '12px 15px',
              borderRadius: '9px',
              marginBottom: '18px',
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '1.45fr 0.8fr',
            gap: '20px',
          }}
        >
          <section
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              padding: '25px',
            }}
          >
            <h2
              style={{
                margin: '0 0 18px',
                fontSize: '18px',
              }}
            >
              Grievance Details
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2, 1fr)',
                gap: '18px',
                marginBottom: '24px',
              }}
            >
              <InfoItem
                label="Category"
                value={
                  grievance.category ||
                  'General'
                }
              />

              <InfoItem
                label="Submitted"
                value={formatDate(
                  grievance.created_at
                )}
              />

              <InfoItem
                label="Visibility"
                value={
                  grievance.anonymous
                    ? 'Anonymous'
                    : 'Identified'
                }
              />

              <InfoItem
                label="Student ID"
                value={
                  grievance.anonymous
                    ? 'Hidden'
                    : grievance.student_id ||
                      '—'
                }
              />
            </div>

            <div
              style={{
                borderTop:
                  '1px solid #eef0f3',
                paddingTop: '22px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.8px',
                  marginBottom: '10px',
                }}
              >
                DESCRIPTION
              </div>

              <p
                style={{
                  margin: 0,
                  color: '#475569',
                  fontSize: '14px',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {grievance.description ||
                  'No description provided.'}
              </p>
            </div>
          </section>

          <section
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              padding: '25px',
              height: 'fit-content',
            }}
          >
            <h2
              style={{
                margin: '0 0 20px',
                fontSize: '18px',
              }}
            >
              Case Management
            </h2>

            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '7px',
              }}
            >
              Status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              style={{
                width: '100%',
                padding: '11px',
                border:
                  '1px solid #dbe1e8',
                borderRadius: '8px',
                marginBottom: '18px',
                background: 'white',
              }}
            >
              {statuses.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '7px',
              }}
            >
              Priority
            </label>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
              style={{
                width: '100%',
                padding: '11px',
                border:
                  '1px solid #dbe1e8',
                borderRadius: '8px',
                marginBottom: '22px',
                background: 'white',
              }}
            >
              {priorities.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                border: 'none',
                background: saving
                  ? '#93c5fd'
                  : '#2563eb',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: saving
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </button>
          </section>
        </div>

        <section
          style={{
            marginTop: '20px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            padding: '24px',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px',
              fontSize: '18px',
            }}
          >
            Case Timeline
          </h2>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            {statuses.map((item, index) => {
              const currentIndex =
                statuses.indexOf(
                  grievance.status
                )

              const completed =
                index <= currentIndex

              return (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      padding: '8px 11px',
                      borderRadius: '20px',
                      background: completed
                        ? '#dbeafe'
                        : '#f1f5f9',
                      color: completed
                        ? '#1d4ed8'
                        : '#94a3b8',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {item}
                  </div>

                  {index <
                    statuses.length - 1 && (
                    <span
                      style={{
                        color: '#cbd5e1',
                      }}
                    >
                      →
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <div
        style={{
          color: '#94a3b8',
          fontSize: '10px',
          fontWeight: 800,
          letterSpacing: '0.7px',
          marginBottom: '5px',
        }}
      >
        {label.toUpperCase()}
      </div>

      <div
        style={{
          color: '#334155',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  )
}

export default StaffGrievanceDetail