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
  
  attachment?: {
    filename: string
    content_type: string
    size: number
    url: string | null
  } | null

}

function ManagerGrievanceDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [grievance, setGrievance] =
    useState<Grievance | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchGrievance = async () => {
      const token =
        localStorage.getItem('access_token')

      if (!token) {
        navigate('/')
        return
      }

      if (!id) {
        setError('Invalid grievance ID.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/api/admin/grievances/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail ||
              'Unable to load grievance.'
          )
        }

        const item = data.grievance || data

        setGrievance(item)
        setStatus(item.status || '')
        setPriority(item.priority || '')
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load grievance.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchGrievance()
  }, [id, navigate])

  const updateGrievance = async () => {
    const token =
      localStorage.getItem('access_token')

    if (!token || !id) return

    try {
      setSaving(true)
      setMessage('')
      setError('')

      const response = await fetch(
        `/api/admin/grievances/${id}`,
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

    return new Date(date).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f6f8fb',
          color: '#64748b',
          fontSize: '16px',
        }}
      >
        Loading grievance details...
      </div>
    )
  }

  if (!grievance) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f6f8fb',
          padding: '60px',
        }}
      >
        <button
          onClick={() =>
            navigate('/manager/grievances')
          }
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          ← Back to Grievances
        </button>

        <h2 style={{ marginTop: '30px' }}>
          Grievance not found
        </h2>

        <p style={{ color: '#64748b' }}>
          {error}
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f6f8fb',
        color: '#0f172a',
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: '#111827',
          color: 'white',
          padding: '26px 50px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
            }}
          >
            CampusResolve
          </h1>

          <p
            style={{
              margin: '6px 0 0',
              color: '#93c5fd',
            }}
          >
            Manager Portal / Grievance Details
          </p>
        </div>

        <button
          onClick={() =>
            navigate('/manager/grievances')
          }
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #475569',
            background: 'transparent',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          ← Grievance Queue
        </button>
      </header>

      {/* CONTENT */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '45px 40px',
        }}
      >
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              color: '#55739a',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Grievance Review
          </div>

          <h2
            style={{
              fontSize: '36px',
              margin: '10px 0',
            }}
          >
            {grievance.title}
          </h2>

          <p
            style={{
              color: '#64748b',
              margin: 0,
            }}
          >
            Grievance ID: {grievance.id}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#be123c',
              padding: '15px',
              borderRadius: '9px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#047857',
              padding: '15px',
              borderRadius: '9px',
              marginBottom: '20px',
            }}
          >
            {message}
          </div>
        )}

        
        {/* ATTACHMENT */}

        {grievance?.attachment && (
          <section
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '28px',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: '#0f172a',
                fontSize: '19px',
              }}
            >
              Attached File
            </h2>

            <p style={{ color: '#475569' }}>
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
                  Open attachment
                </a>
              )
            ) : (
              <p style={{ color: '#b91c1c' }}>
                Attachment URL unavailable. Please refresh the page.
              </p>
            )}
          </section>
        )}


        {/* DETAILS */}
        <section
          style={{
            background: 'white',
            border: '1px solid #dbe3ed',
            borderRadius: '14px',
            padding: '28px',
            marginBottom: '22px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            Grievance Information
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, 1fr)',
              gap: '22px',
            }}
          >
            <div>
              <strong>Category</strong>
              <p style={{ color: '#64748b' }}>
                {grievance.category}
              </p>
            </div>

            <div>
              <strong>Student</strong>
              <p style={{ color: '#64748b' }}>
                {grievance.anonymous
                  ? 'Anonymous'
                  : grievance.student_id || '—'}
              </p>
            </div>

            <div>
              <strong>Submitted</strong>
              <p style={{ color: '#64748b' }}>
                {formatDate(
                  grievance.created_at
                )}
              </p>
            </div>

            <div>
              <strong>Current Status</strong>
              <p style={{ color: '#64748b' }}>
                {grievance.status}
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop:
                '1px solid #e2e8f0',
            }}
          >
            <strong>Description</strong>

            <p
              style={{
                color: '#475569',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {grievance.description}
            </p>
          </div>
        </section>

        {/* MANAGEMENT */}
        <section
          style={{
            background: 'white',
            border: '1px solid #dbe3ed',
            borderRadius: '14px',
            padding: '28px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            Manager Actions
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, 1fr)',
              gap: '20px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                }}
              >
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border:
                    '1px solid #cbd5e1',
                  background: 'white',
                }}
              >
                <option value="Submitted">
                  Submitted
                </option>

                <option value="Under Review">
                  Under Review
                </option>

                <option value="Assigned">
                  Assigned
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Awaiting Student">
                  Awaiting Student
                </option>

                <option value="Resolved">
                  Resolved
                </option>

                <option value="Closed">
                  Closed
                </option>

                <option value="Reopened">
                  Reopened
                </option>

                <option value="Rejected">
                  Rejected
                </option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                }}
              >
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value)
                }
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border:
                    '1px solid #cbd5e1',
                  background: 'white',
                }}
              >
                <option value="Low">
                  Low
                </option>

                <option value="Normal">
                  Normal
                </option>

                <option value="High">
                  High
                </option>

                <option value="Critical">
                  Critical
                </option>
              </select>
            </div>
          </div>

          <button
            onClick={updateGrievance}
            disabled={saving}
            style={{
              marginTop: '25px',
              padding: '12px 22px',
              borderRadius: '8px',
              border: 'none',
              background: saving
                ? '#94a3b8'
                : '#2563eb',
              color: 'white',
              cursor: saving
                ? 'not-allowed'
                : 'pointer',
              fontWeight: 600,
            }}
          >
            {saving
              ? 'Saving...'
              : 'Save Changes'}
          </button>
        </section>
      </main>
    </div>
  )
}

export default ManagerGrievanceDetails