import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Grievance {
  id: string
  title: string
  category: string
  description: string
  status: string
  priority: string
  anonymous: boolean
  created_at?: string
  student_id: string
  department_name?: string
  assignment_status?: string
}
function AdminGrievances() {
  const navigate = useNavigate()

  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadGrievances = async () => {
      try {
        const token = localStorage.getItem('access_token')

        if (!token) {
          navigate('/')
          return
        }

        const response = await fetch(
          '/api/admin/grievances',
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

        setGrievances(data.grievances || [])
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

    loadGrievances()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('student')
    navigate('/')
  }

  const openGrievance = (grievanceId: string) => {
    navigate(`/admin/grievances/${grievanceId}`)
  }

  const handleDeleteGrievance = async (
  grievanceId: string
) => {
  if (!window.confirm('Are you sure you want to delete this grievance?')) {
    return
  }

  try {
    const token = localStorage.getItem('access_token')

    const response = await fetch(
      `/api/grievances/${grievanceId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || 'Unable to delete grievance.')
    }

    setGrievances((previous) =>
      previous.filter((item) => item.id !== grievanceId)
    )

    alert('Grievance deleted successfully.')
  } catch (err) {
    alert(
      err instanceof Error ? err.message : 'Something went wrong.'
    )
  }
}

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'resolved'

      case 'closed':
        return 'closed'

      case 'rejected':
        return 'rejected'

      case 'in progress':
        return 'progress'

      case 'assigned':
        return 'assigned'

      default:
        return 'open'
    }
  }

  const getPriorityClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'critical'

      case 'high':
        return 'high'

      case 'low':
        return 'low'

      default:
        return 'normal'
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
      }}
    >

      {/* Header */}

      <header
        style={{
          background: '#111827',
          color: '#ffffff',
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >

        <div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
            }}
          >
            CampusResolve
          </div>

          <div
            style={{
              fontSize: '13px',
              color: '#94a3b8',
              marginTop: '3px',
            }}
          >
            Administration / Grievance Management
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
          }}
        >

          <button
            onClick={() => navigate('/admin')}
            style={{
              border: '1px solid #475569',
              background: 'transparent',
              color: '#ffffff',
              padding: '9px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            ← Dashboard
          </button>

          <button
            onClick={handleLogout}
            style={{
              border: 'none',
              background: '#ef4444',
              color: '#ffffff',
              padding: '9px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>

        </div>

      </header>


      {/* Main */}

      <main
        style={{
          padding: '40px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >

        <div
          style={{
            marginBottom: '30px',
          }}
        >

          <div
            style={{
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
            }}
          >
            GRIEVANCE MANAGEMENT
          </div>

          <h1
            style={{
              margin: '8px 0',
              color: '#0f172a',
              fontSize: '32px',
            }}
          >
            Institutional Grievances
          </h1>

          <p
            style={{
              margin: 0,
              color: '#64748b',
            }}
          >
            Review and monitor grievances submitted across the institution.
          </p>

        </div>


        {/* Summary */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
        >

          <div
            style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ color: '#64748b', fontSize: '13px' }}>
              Total grievances
            </div>

            <strong
              style={{
                display: 'block',
                marginTop: '8px',
                fontSize: '28px',
                color: '#0f172a',
              }}
            >
              {grievances.length}
            </strong>
          </div>


          <div
            style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ color: '#64748b', fontSize: '13px' }}>
              Open cases
            </div>

            <strong
              style={{
                display: 'block',
                marginTop: '8px',
                fontSize: '28px',
                color: '#2563eb',
              }}
            >
              {
                grievances.filter(
                  (item) =>
                    !['Resolved', 'Closed', 'Rejected'].includes(
                      item.status
                    )
                ).length
              }
            </strong>
          </div>


          <div
            style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ color: '#64748b', fontSize: '13px' }}>
              Resolved
            </div>

            <strong
              style={{
                display: 'block',
                marginTop: '8px',
                fontSize: '28px',
                color: '#16a34a',
              }}
            >
              {
                grievances.filter(
                  (item) => item.status === 'Resolved'
                ).length
              }
            </strong>
          </div>

        </div>


        {/* Error */}

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '16px',
              borderRadius: '10px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}


        {/* Loading */}

        {loading && (
          <div
            style={{
              background: '#ffffff',
              padding: '40px',
              textAlign: 'center',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              color: '#64748b',
            }}
          >
            Loading grievances...
          </div>
        )}


        {/* Empty */}

        {!loading && !error && grievances.length === 0 && (
          <div
            style={{
              background: '#ffffff',
              padding: '50px',
              textAlign: 'center',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              color: '#64748b',
            }}
          >
            No grievances have been submitted yet.
          </div>
        )}


        {/* Grievance Table */}

        {!loading && grievances.length > 0 && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >

            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: '#0f172a',
                  fontSize: '19px',
                }}
              >
                All Grievances
              </h2>
            </div>


            <div style={{ overflowX: 'auto' }}>

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '900px',
                }}
              >

                <thead>



                  <tr
                    style={{
                      background: '#f8fafc',
                      borderBottom:
                        '1px solid #e2e8f0',
                    }}
                  >

                    <th style={thStyle}>
                      Grievance
                    </th>

                    <th style={thStyle}>
                      Category
                    </th>

                    <th style={thStyle}>
                      Student
                    </th>

                    <th style={thStyle}>
                      Priority
                    </th>

                    <th style={thStyle}>
                      Status
                    </th>
                    <th style={thStyle}>
                      Department
                    </th>

                    <th style={thStyle}>
                      Submitted
                    </th>

                    <th style={thStyle}>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {grievances.map((grievance) => (

                    <tr
                      key={grievance.id}
                      onClick={() =>
                        openGrievance(grievance.id)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' ||
                          event.key === ' '
                        ) {
                          event.preventDefault()
                          openGrievance(grievance.id)
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      title="Open grievance details"
                      style={{
                        borderBottom:
                          '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition:
                          'background 0.15s ease',
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background =
                          '#f8fafc'
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background =
                          '#ffffff'
                      }}
                    >

                      <td style={tdStyle}>

                        <div
                          style={{
                            fontWeight: 600,
                            color: '#0f172a',
                          }}
                        >
                          {grievance.title}
                        </div>

                        <div
                          style={{
                            marginTop: '5px',
                            fontSize: '12px',
                            color: '#94a3b8',
                          }}
                        >
                          ID: {grievance.id.slice(-8)}
                        </div>

                      </td>


                      <td style={tdStyle}>
  {grievance.category || 'General'}
</td>

<td style={tdStyle}>
  {grievance.anonymous
    ? 'Anonymous'
    : grievance.student_id || 'Unknown'}
</td>

<td style={tdStyle}>
  <span
    className={`admin-grievance-badge ${getPriorityClass(
      grievance.priority
    )}`}
  >
    {grievance.priority}
  </span>
</td>

<td style={tdStyle}>
  <span
    className={`admin-grievance-badge ${getStatusClass(
      grievance.status
    )}`}
  >
    {grievance.status}
  </span>
</td>

<td style={tdStyle}>
  <div style={{ fontWeight: 600 }}>
    {grievance.department_name || 'Unassigned'}
  </div>
  <div
    style={{
      marginTop: '5px',
      fontSize: '12px',
      color: '#94a3b8',
    }}
  >
    {grievance.assignment_status || 'Pending assignment'}
  </div>
</td>

<td style={tdStyle}>
  {grievance.created_at
    ? new Date(grievance.created_at).toLocaleDateString()
    : '—'}
</td>

<td style={tdStyle}>
  <button
    onClick={(event) => {
      event.stopPropagation()
      handleDeleteGrievance(grievance.id)
    }}
    style={{
      background: '#fee2e2',
      color: '#dc2626',
      border: '1px solid #fecaca',
      padding: '8px 12px',
      borderRadius: '7px',
      cursor: 'pointer',
      fontWeight: 600,
    }}
  >
    🗑️ Delete
  </button>
</td>
                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </main>

    </div>
  )
}


const thStyle: React.CSSProperties = {
  padding: '15px 18px',
  textAlign: 'left',
  color: '#475569',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
}

const tdStyle: React.CSSProperties = {
  padding: '17px 18px',
  color: '#475569',
  fontSize: '14px',
}

export default AdminGrievances
