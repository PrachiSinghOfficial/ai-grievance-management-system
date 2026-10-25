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

function StaffGrievances() {
  const navigate = useNavigate()

  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      navigate('/')
      return
    }

    fetch('/api/staff/grievances', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(
            data.detail || 'Unable to load grievances.'
          )
        }

        return response.json()
      })
      .then((data) => {
        setGrievances(data.grievances || [])
      })
      .catch((err) => {
        setError(err.message || 'Something went wrong.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [navigate])

  const filteredGrievances = useMemo(() => {
    const query = search.trim().toLowerCase()

    return grievances.filter((grievance) => {
      const matchesSearch =
        !query ||
        grievance.title.toLowerCase().includes(query) ||
        grievance.category.toLowerCase().includes(query) ||
        grievance.id.toLowerCase().includes(query)

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

  const total = grievances.length

  const openCases = grievances.filter(
    (item) =>
      !['Resolved', 'Closed', 'Rejected'].includes(
        item.status
      )
  ).length

  const criticalCases = grievances.filter(
    (item) => item.priority === 'Critical'
  ).length

  const resolvedCases = grievances.filter(
    (item) =>
      item.status === 'Resolved' ||
      item.status === 'Closed'
  ).length

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('student')
    navigate('/')
  }

  const getStatusClass = (status: string) => {
    return `staff-queue-status staff-queue-status-${status
      .toLowerCase()
      .replace(/\s+/g, '-')}`
  }

  const getPriorityClass = (priority: string) => {
    return `staff-queue-priority staff-queue-priority-${priority.toLowerCase()}`
  }

  const formatDate = (date?: string) => {
    if (!date) return '—'

    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) {
      return '—'
    }

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
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
          alignItems: 'center',
          justifyContent: 'space-between',
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
              marginTop: '3px',
              fontSize: '11px',
              color: '#94a3b8',
            }}
          >
            Staff Portal · Grievance Queue
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <button
            onClick={() => navigate('/staff')}
            style={{
              border: '1px solid #334155',
              background: 'transparent',
              color: '#e2e8f0',
              padding: '8px 13px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Dashboard
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
          maxWidth: '1400px',
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
            STAFF OPERATIONS
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              letterSpacing: '-0.7px',
            }}
          >
            Grievance Queue
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              color: '#64748b',
              fontSize: '14px',
            }}
          >
            Review and process submitted student grievances.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(4, minmax(0, 1fr))',
            gap: '16px',
            marginBottom: '22px',
          }}
        >
          <SummaryCard
            label="Total Cases"
            value={total}
            icon="▦"
          />

          <SummaryCard
            label="Open Cases"
            value={openCases}
            icon="◷"
          />

          <SummaryCard
            label="Critical"
            value={criticalCases}
            icon="!"
          />

          <SummaryCard
            label="Resolved"
            value={resolvedCases}
            icon="✓"
          />
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '13px 16px',
              borderRadius: '10px',
              marginBottom: '18px',
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '15px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '20px',
              borderBottom: '1px solid #eef0f3',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              placeholder="Search by title, category or ID..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              style={{
                flex: '1 1 280px',
                minWidth: '240px',
                padding: '11px 13px',
                border: '1px solid #dbe1e8',
                borderRadius: '9px',
                outline: 'none',
                fontSize: '13px',
              }}
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              style={{
                padding: '11px 13px',
                border: '1px solid #dbe1e8',
                borderRadius: '9px',
                background: 'white',
                fontSize: '13px',
              }}
            >
              <option value="All">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">
                Under Review
              </option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">
                In Progress
              </option>
              <option value="Awaiting Student">
                Awaiting Student
              </option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Reopened">Reopened</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
              style={{
                padding: '11px 13px',
                border: '1px solid #dbe1e8',
                borderRadius: '9px',
                background: 'white',
                fontSize: '13px',
              }}
            >
              <option value="All">All Priority</option>
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {loading ? (
            <div
              style={{
                padding: '55px 20px',
                textAlign: 'center',
                color: '#64748b',
              }}
            >
              Loading grievances...
            </div>
          ) : filteredGrievances.length === 0 ? (
            <div
              style={{
                padding: '55px 20px',
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
                  borderCollapse: 'collapse',
                  minWidth: '900px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#f8fafc',
                    }}
                  >
                    <th className="staff-queue-th">
                      Grievance
                    </th>

                    <th className="staff-queue-th">
                      Category
                    </th>

                    <th className="staff-queue-th">
                      Priority
                    </th>

                    <th className="staff-queue-th">
                      Status
                    </th>

                    <th className="staff-queue-th">
                      Submitted
                    </th>

                    <th className="staff-queue-th">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredGrievances.map(
                    (grievance) => (
                      <tr key={grievance.id}>
                        <td className="staff-queue-td">
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '13px',
                              marginBottom: '4px',
                            }}
                          >
                            {grievance.title}
                          </div>

                          <div
                            style={{
                              color: '#94a3b8',
                              fontSize: '10px',
                              fontFamily:
                                'monospace',
                            }}
                          >
                            #{grievance.id.slice(-8)}
                          </div>
                        </td>

                        <td className="staff-queue-td">
                          {grievance.category || 'General'}
                        </td>

                        <td className="staff-queue-td">
                          <span
                            className={getPriorityClass(
                              grievance.priority
                            )}
                          >
                            {grievance.priority}
                          </span>
                        </td>

                        <td className="staff-queue-td">
                          <span
                            className={getStatusClass(
                              grievance.status
                            )}
                          >
                            {grievance.status}
                          </span>
                        </td>

                        <td className="staff-queue-td">
                          {formatDate(
                            grievance.created_at
                          )}
                        </td>

                        <td className="staff-queue-td">
                          <button
                            onClick={() =>
                              navigate(
  `/staff/grievances/${grievance.id}`
)
                            }
                            style={{
                              border: 'none',
                              background: '#eff6ff',
                              color: '#2563eb',
                              padding: '8px 12px',
                              borderRadius: '7px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #eef0f3',
              color: '#64748b',
              fontSize: '12px',
            }}
          >
            Showing {filteredGrievances.length} of{' '}
            {total} grievances
          </div>
        </section>
      </main>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: string
}) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '13px',
        padding: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: '13px',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '17px',
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color: '#64748b',
            fontSize: '11px',
            marginBottom: '4px',
          }}
        >
          {label}
        </div>

        <strong
          style={{
            fontSize: '23px',
          }}
        >
          {value}
        </strong>
      </div>
    </div>
  )
}

export default StaffGrievances