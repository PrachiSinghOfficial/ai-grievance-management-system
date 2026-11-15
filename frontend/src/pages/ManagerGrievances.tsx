import { useEffect, useMemo, useState } from 'react'
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
  student_id?: string
}

const statuses = [
  'All',
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
  'All',
  'Low',
  'Normal',
  'High',
  'Critical',
]

function ManagerGrievances() {
  const navigate = useNavigate()

  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchManagerGrievances = async () => {
      const token = localStorage.getItem('access_token')

      if (!token) {
        navigate('/')
        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          '/api/manager/grievances',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail ||
              'Unable to load manager grievances.'
          )
        }

        setGrievances(data.grievances || [])
      } catch (error) {
        console.error(error)

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load grievances.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchManagerGrievances()
  }, [navigate])

  const filteredGrievances = useMemo(() => {
    return grievances.filter((grievance) => {
      const searchText = search
        .toLowerCase()
        .trim()

      const matchesSearch =
        !searchText ||
        grievance.title
          .toLowerCase()
          .includes(searchText) ||
        grievance.category
          .toLowerCase()
          .includes(searchText) ||
        grievance.id
          .toLowerCase()
          .includes(searchText)

      const matchesStatus =
        statusFilter === 'All' ||
        grievance.status === statusFilter

      const matchesPriority =
        priorityFilter === 'All' ||
        grievance.priority === priorityFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      )
    })
  }, [
    grievances,
    search,
    statusFilter,
    priorityFilter,
  ])

  const openCount = grievances.filter(
    (item) =>
      ![
        'Resolved',
        'Closed',
        'Rejected',
      ].includes(item.status)
  ).length

  const criticalCount = grievances.filter(
    (item) => item.priority === 'Critical'
  ).length

  const resolvedCount = grievances.filter(
    (item) =>
      item.status === 'Resolved' ||
      item.status === 'Closed'
  ).length

    const handleDeleteGrievance = async (
    grievanceId: string
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this grievance?'
    )

    if (!confirmed) return

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
        throw new Error(
          data.detail || 'Unable to delete grievance.'
        )
      }

      setGrievances((previous) =>
        previous.filter(
          (item) => item.id !== grievanceId
        )
      )

      alert('Grievance deleted successfully.')
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('student')
    navigate('/')
  }

  const formatDate = (date?: string) => {
    if (!date) {
      return '—'
    }

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  const statusClass = (status: string) => {
    if (
      status === 'Resolved' ||
      status === 'Closed'
    ) {
      return {
        background: '#dcfce7',
        color: '#15803d',
      }
    }

    if (status === 'Rejected') {
      return {
        background: '#fee2e2',
        color: '#b91c1c',
      }
    }

    if (
      status === 'In Progress' ||
      status === 'Assigned'
    ) {
      return {
        background: '#dbeafe',
        color: '#1d4ed8',
      }
    }

    return {
      background: '#fef3c7',
      color: '#92400e',
    }
  }

  const priorityClass = (priority: string) => {
    if (priority === 'Critical') {
      return {
        background: '#fee2e2',
        color: '#b91c1c',
      }
    }

    if (priority === 'High') {
      return {
        background: '#ffedd5',
        color: '#c2410c',
      }
    }

    if (priority === 'Low') {
      return {
        background: '#dcfce7',
        color: '#15803d',
      }
    }

    return {
      background: '#e5e7eb',
      color: '#374151',
    }
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
          padding: '28px 50px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '30px',
            }}
          >
            CampusResolve
          </h1>

          <p
            style={{
              margin: '6px 0 0',
              color: '#93c5fd',
              fontSize: '15px',
            }}
          >
            Manager Portal / Grievance Queue
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
          }}
        >
          <button
            onClick={() =>
              navigate('/manager')
            }
            style={{
              padding: '11px 18px',
              borderRadius: '9px',
              border: '1px solid #475569',
              background: 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ← Dashboard
          </button>

          <button
            onClick={logout}
            style={{
              padding: '11px 18px',
              borderRadius: '9px',
              border: 'none',
              background: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}

      <main
        style={{
          maxWidth: '1500px',
          margin: '0 auto',
          padding: '48px 50px',
        }}
      >
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              color: '#55739a',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Manager Operations
          </div>

          <h2
            style={{
              fontSize: '38px',
              margin: '10px 0',
            }}
          >
            Grievance Queue
          </h2>

          <p
            style={{
              color: '#64748b',
              fontSize: '17px',
              margin: 0,
            }}
          >
            Review and monitor grievances
            across your department.
          </p>
        </div>

        {/* SUMMARY */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          {[
            ['Total Grievances', grievances.length],
            ['Open Cases', openCount],
            ['Critical', criticalCount],
            ['Resolved', resolvedCount],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              style={{
                background: 'white',
                border: '1px solid #dbe3ed',
                borderRadius: '14px',
                padding: '24px',
                boxShadow:
                  '0 4px 14px rgba(15,23,42,0.04)',
              }}
            >
              <div
                style={{
                  color: '#64748b',
                  fontSize: '14px',
                }}
              >
                {label}
              </div>

              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  marginTop: '10px',
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              background: '#fff1f2',
              border:
                '1px solid #fecdd3',
              color: '#be123c',
              padding: '18px 20px',
              borderRadius: '10px',
              marginBottom: '24px',
            }}
          >
            {error}
          </div>
        )}

        {/* FILTERS */}

        <div
          style={{
            background: 'white',
            border: '1px solid #dbe3ed',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns:
              '2fr 1fr 1fr',
            gap: '14px',
          }}
        >
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search title, category or grievance ID..."
            style={{
              padding: '13px 15px',
              borderRadius: '8px',
              border:
                '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none',
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            style={{
              padding: '13px 15px',
              borderRadius: '8px',
              border:
                '1px solid #cbd5e1',
              fontSize: '14px',
              background: 'white',
            }}
          >
            {statuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(
                e.target.value
              )
            }
            style={{
              padding: '13px 15px',
              borderRadius: '8px',
              border:
                '1px solid #cbd5e1',
              fontSize: '14px',
              background: 'white',
            }}
          >
            {priorities.map((priority) => (
              <option
                key={priority}
                value={priority}
              >
                {priority}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE */}

        <div
          style={{
            background: 'white',
            border: '1px solid #dbe3ed',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div
              style={{
                padding: '50px',
                textAlign: 'center',
                color: '#64748b',
              }}
            >
              Loading manager grievance queue...
            </div>
          ) : filteredGrievances.length === 0 ? (
            <div
              style={{
                padding: '60px',
                textAlign: 'center',
                color: '#64748b',
              }}
            >
              No grievances found.
            </div>
          ) : (
            <div
              style={{
                overflowX: 'auto',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse:
                    'collapse',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        '#f8fafc',
                    }}
                  >
                    {[
                      'Grievance',
                      'Category',
                      'Priority',
                      'Status',
                      'Submitted',
                      'Action',
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          textAlign: 'left',
                          padding:
                            '16px 18px',
                          fontSize: '12px',
                          color:
                            '#64748b',
                          textTransform:
                            'uppercase',
                          letterSpacing:
                            '0.5px',
                          borderBottom:
                            '1px solid #e2e8f0',
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredGrievances.map(
                    (grievance) => (
                      <tr
                        key={
                          grievance.id
                        }
                        style={{
                          borderBottom:
                            '1px solid #edf2f7',
                        }}
                      >
                        <td
                          style={{
                            padding:
                              '18px',
                            minWidth:
                              '280px',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              marginBottom:
                                '5px',
                            }}
                          >
                            {
                              grievance.title
                            }
                          </div>

                          <div
                            style={{
                              color:
                                '#94a3b8',
                              fontSize:
                                '12px',
                            }}
                          >
                            ID:{' '}
                            {
                              grievance.id
                            }
                          </div>
                        </td>

                        <td
                          style={{
                            padding:
                              '18px',
                            color:
                              '#475569',
                          }}
                        >
                          {
                            grievance.category
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              '18px',
                          }}
                        >
                          <span
                            style={{
                              ...priorityClass(
                                grievance.priority
                              ),
                              padding:
                                '6px 10px',
                              borderRadius:
                                '999px',
                              fontSize:
                                '12px',
                              fontWeight: 700,
                            }}
                          >
                            {
                              grievance.priority
                            }
                          </span>
                        </td>

                        <td
                          style={{
                            padding:
                              '18px',
                          }}
                        >
                          <span
                            style={{
                              ...statusClass(
                                grievance.status
                              ),
                              padding:
                                '6px 10px',
                              borderRadius:
                                '999px',
                              fontSize:
                                '12px',
                              fontWeight: 700,
                            }}
                          >
                            {
                              grievance.status
                            }
                          </span>
                        </td>

                        <td
                          style={{
                            padding:
                              '18px',
                            color:
                              '#64748b',
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {formatDate(
                            grievance.created_at
                          )}
                        </td>

                        <td
                          style={{
                            padding:
                              '18px',
                          }}
                        >
                          <button
                            onClick={() =>
                              navigate(`/manager/grievances/${grievance.id}`)
                            }
                            style={{
                              padding:
                                '9px 14px',
                              borderRadius:
                                '8px',
                              border:
                                '1px solid #2563eb',
                              background:
                                '#eff6ff',
                              color:
                                '#1d4ed8',
                              cursor:
                                'pointer',
                              fontWeight:
                                600,
                            }}
                          >
                            Review
                          </button>
                          <button
  onClick={(event) => {
    event.stopPropagation()
    handleDeleteGrievance(grievance.id)
  }}
  style={{
    display: 'block',
    marginTop: '8px',
    padding: '9px 14px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    background: '#fee2e2',
    color: '#dc2626',
    cursor: 'pointer',
    fontWeight: 600,
  }}
>
  🗑️ Delete
</button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ManagerGrievances