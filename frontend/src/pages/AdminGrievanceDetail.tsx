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
  student_id: string
  created_at?: string
  submitted_at?: string
  attachment?: {
  filename: string
  content_type: string
  size: number
  url: string | null
} | null
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

function AdminGrievanceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [grievance, setGrievance] =
    useState<Grievance | null>(null)

  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadGrievance = async () => {
      try {
        const token =
          localStorage.getItem('access_token')

        if (!token) {
          navigate('/')
          return
        }

        const response = await fetch(
          `http://127.0.0.1:8000/admin/grievances/${id}`,
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

        setGrievance(data)
        setStatus(data.status || 'Submitted')
        setPriority(data.priority || 'Normal')
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

    loadGrievance()
  }, [id, navigate])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const token =
        localStorage.getItem('access_token')

      if (!token) {
        navigate('/')
        return
      }

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

      setGrievance((current) => {
        if (!current) {
          return current
        }

        return {
          ...current,
          status,
          priority,
        }
      })

      setSuccess(
        'Grievance updated successfully.'
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif',
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
          padding: '40px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <h2>Unable to load grievance</h2>

        <p>{error}</p>

        <button
          onClick={() =>
            navigate('/admin/grievances')
          }
        >
          ← Back to Grievances
        </button>
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
        background: '#f8fafc',
        padding: '32px',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* BACK */}

        <button
          onClick={() =>
            navigate('/admin/grievances')
          }
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: '#475569',
            fontSize: '15px',
            marginBottom: '24px',
            padding: 0,
          }}
        >
          ← Back to Grievances
        </button>


        {/* HEADER */}

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '20px',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '12px',
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                Grievance ID
              </span>

              <p
                style={{
                  margin: '6px 0 16px',
                  color: '#475569',
                  fontSize: '13px',
                  wordBreak: 'break-all',
                }}
              >
                {grievance.id}
              </p>

              <h1
                style={{
                  margin: 0,
                  color: '#0f172a',
                  fontSize: '28px',
                }}
              >
                {grievance.title}
              </h1>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  padding: '8px 14px',
                  borderRadius: '999px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {grievance.status}
              </span>

              <span
                style={{
                  padding: '8px 14px',
                  borderRadius: '999px',
                  background: '#fef3c7',
                  color: '#92400e',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {grievance.priority}
              </span>
            </div>
          </div>
        </div>


        {/* ERROR */}

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '14px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}


        {/* SUCCESS */}

        {success && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '14px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
            }}
          >
            {success}
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
              grievance.attachment.content_type.startsWith(
                'image/'
              ) ? (
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(0, 2fr) minmax(280px, 1fr)',
            gap: '20px',
          }}
        >
          {/* DESCRIPTION */}

          <section
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '28px',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: '#0f172a',
                fontSize: '19px',
              }}
            >
              Grievance Description
            </h2>

            <p
              style={{
                color: '#475569',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
              }}
            >
              {grievance.description}
            </p>
          </section>


          {/* CASE INFORMATION */}

          <section
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '28px',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: '#0f172a',
                fontSize: '19px',
              }}
            >
              Case Information
            </h2>

            <div
              style={{
                display: 'grid',
                gap: '18px',
              }}
            >
              <div>
                <span
                  style={{
                    display: 'block',
                    color: '#64748b',
                    fontSize: '12px',
                    marginBottom: '5px',
                  }}
                >
                  Category
                </span>

                <strong>
                  {grievance.category ||
                    'Not specified'}
                </strong>
              </div>

              <div>
                <span
                  style={{
                    display: 'block',
                    color: '#64748b',
                    fontSize: '12px',
                    marginBottom: '5px',
                  }}
                >
                  Student
                </span>

                <strong>
                  {grievance.anonymous
                    ? 'Anonymous'
                    : grievance.student_id}
                </strong>
              </div>

              <div>
                <span
                  style={{
                    display: 'block',
                    color: '#64748b',
                    fontSize: '12px',
                    marginBottom: '5px',
                  }}
                >
                  Submitted
                </span>

                <strong>
                  {grievance.submitted_at ||
                    grievance.created_at ||
                    'Not available'}
                </strong>
              </div>
            </div>
          </section>
        </div>


        {/* ADMIN ACTIONS */}

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '28px',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              marginBottom: '22px',
            }}
          >
            <h2
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: '19px',
              }}
            >
              Case Management
            </h2>

            <p
              style={{
                margin: '7px 0 0',
                color: '#64748b',
                fontSize: '14px',
              }}
            >
              Update the grievance status and priority.
            </p>
          </div>


          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
            }}
          >
            {/* STATUS */}

            <div>
              <label
                htmlFor="grievance-status"
                style={{
                  display: 'block',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                Status
              </label>

              <select
                id="grievance-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '9px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '14px',
                  outline: 'none',
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
            </div>


            {/* PRIORITY */}

            <div>
              <label
                htmlFor="grievance-priority"
                style={{
                  display: 'block',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                Priority
              </label>

              <select
                id="grievance-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value)
                }
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '9px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '14px',
                  outline: 'none',
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
            </div>
          </div>


          {/* SAVE */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '24px',
            }}
          >
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                border: 'none',
                background: saving
                  ? '#94a3b8'
                  : '#2563eb',
                color: '#ffffff',
                padding: '12px 22px',
                borderRadius: '9px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: saving
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {saving
                ? 'Saving...'
                : 'Save Update'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminGrievanceDetail