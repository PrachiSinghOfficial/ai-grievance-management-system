import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  department_id?: string
  department_name?: string
}

interface DashboardData {
  users: {
    total: number
    students: number
    staff: number
    managers: number
    admins: number
  }
  grievances: {
    total: number
    open: number
    resolved: number
    closed: number
  }
}

function AdminDashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState<AdminUser | null>(null)
  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null)

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [roleMessage, setRoleMessage] = useState('')

  const [departments, setDepartments] = useState<
  { id: string; name: string }[]
>([])
const [pendingManagerUserId, setPendingManagerUserId] =
  useState<string | null>(null)

const [selectedDepartmentId, setSelectedDepartmentId] =
  useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAdminPortal = async () => {
      try {
        const token = localStorage.getItem('access_token')

        if (!token) {
          navigate('/')
          return
        }

        const dashboardResponse = await fetch(
          '/api/admin/dashboard',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const dashboardResult =
          await dashboardResponse.json()

        if (!dashboardResponse.ok) {
          throw new Error(
            dashboardResult.detail ||
              'Unable to access admin portal.'
          )
        }

        setDashboardData(dashboardResult)

        const usersResponse = await fetch(
          '/api/admin/users',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const usersResult = await usersResponse.json()

        if (usersResponse.ok) {
          setAdminUsers(usersResult.users || [])
        } else {
          console.error(
            usersResult.detail || 'Unable to load users.'
          )
        }

        const departmentsResponse = await fetch(
  '/api/admin/departments',
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
)

const departmentsResult = await departmentsResponse.json()

if (departmentsResponse.ok) {
  setDepartments(departmentsResult.departments || [])
} else {
  console.error(
    departmentsResult.detail || 'Unable to load departments.'
  )
}

        const storedUser =
          localStorage.getItem('student')

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)

          setUser({
            id: parsedUser.id || '',
            name: parsedUser.name || '',
            email: parsedUser.email || '',
            role: parsedUser.role || 'admin',
          })
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong.'
        )
      } finally {
        setLoading(false)
        setUsersLoading(false)
      }
    }

    loadAdminPortal()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('student')
    navigate('/')
  }

  const scrollToUsers = () => {
    document
      .getElementById('users-management')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
  }

  const handleRoleChange = async (
    userId: string,
    newRole: string,
departmentId?: string
  ) => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      navigate('/')
      return
    }

    setSavingUserId(userId)
    setRoleMessage('')

    try {
      const response = await fetch(
        `/api/admin/users/${userId}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
  role: newRole,
  department_id: departmentId || null,
}),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.detail || 'Unable to update user role.'
        )
      }

      setAdminUsers((currentUsers) =>
  currentUsers.map((adminUser) =>
    adminUser.id === userId
      ? {
          ...adminUser,
          role: result.user.role,
          department_id: result.user.department_id || '',
          department_name: result.user.department_name || '',
        }
      : adminUser
  )
)

      setRoleMessage(
        `Role updated successfully for ${result.user.name}.`
      )

      setTimeout(() => {
        setRoleMessage('')
      }, 3000)
    } catch (err) {
      setRoleMessage(
        err instanceof Error
          ? err.message
          : 'Unable to update user role.'
      )
    } finally {
      setSavingUserId(null)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        Loading Admin Workspace...
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-error">
        <h2>Access unavailable</h2>
        <p>{error}</p>

        <button onClick={() => navigate('/')}>
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-logo">
            🛡️
          </div>

          <div>
            <h2>CampusResolve</h2>
            <span>Administration</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className="admin-nav-item active"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate('/admin/grievances')}
          >
            <span>📋</span>
            Grievances
          </button>

          <button
            className="admin-nav-item"
            onClick={scrollToUsers}
          >
            <span>👥</span>
            Users
          </button>

          
         

<button
  className="admin-nav-item"
  onClick={() => navigate('/admin/departments')}
>
  <span>🏢</span>
  Departments
</button>

<button
  className="admin-nav-item"
  onClick={() => navigate('/admin/settings')}
>
  <span>⚙️</span>
  System Settings
</button>

<button
  className="admin-nav-item"
  onClick={() => navigate('/admin/reports')}
>
  <span>📊</span>
  Reports
</button>

<button
  className="admin-nav-item"
  onClick={() => navigate('/admin/audit-history')}
>
  <span>🔐</span>
  Audit History
</button>


        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-security">
            🔒 Secure Admin Workspace
          </div>

          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">
              CAMPUSRESOLVE / ADMINISTRATION
            </p>

            <h1>Admin Dashboard</h1>

            <p className="admin-subtitle">
              Monitor and manage the grievance ecosystem
              across the institution.
            </p>
          </div>

          <div className="admin-user">
            <div className="admin-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>

            <div>
              <strong>
                {user?.name || 'Administrator'}
              </strong>

              <span>Super Admin</span>
            </div>
          </div>
        </header>

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <span>OVERVIEW</span>
              <h2>System at a glance</h2>
            </div>

            <span className="live-status">
              ● System Online
            </span>
          </div>

          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="stat-icon">📋</div>

              <div>
                <span>Total grievances</span>

                <strong>
                  {dashboardData?.grievances?.total ?? 0}
                </strong>

                <small>All submitted grievances</small>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon">⏳</div>

              <div>
                <span>Pending review</span>

                <strong>
                  {dashboardData?.grievances?.open ?? 0}
                </strong>

                <small>Currently open cases</small>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon">🚨</div>

              <div>
                <span>SLA breaches</span>

                <strong>0</strong>

                <small>
                  SLA monitoring coming next
                </small>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon">👥</div>

              <div>
                <span>Active users</span>

                <strong>
                  {dashboardData?.users?.total ?? 0}
                </strong>

                <small>
                  Registered system users
                </small>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <span>USERS</span>
              <h2>Account distribution</h2>
            </div>
          </div>

          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="stat-icon">🎓</div>

              <div>
                <span>Students</span>

                <strong>
                  {dashboardData?.users?.students ?? 0}
                </strong>

                <small>Student accounts</small>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon">🧑‍💼</div>

              <div>
                <span>Staff</span>

                <strong>
                  {dashboardData?.users?.staff ?? 0}
                </strong>

                <small>Staff accounts</small>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon">🏢</div>

              <div>
                <span>Managers</span>

                <strong>
                  {dashboardData?.users?.managers ?? 0}
                </strong>

                <small>
                  Department managers
                </small>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon">🛡️</div>

              <div>
                <span>Administrators</span>

                <strong>
                  {dashboardData?.users?.admins ?? 0}
                </strong>

                <small>Admin accounts</small>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <span>GRIEVANCES</span>
              <h2>Current case status</h2>
            </div>
          </div>

          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="stat-icon">🔵</div>

              <div>
                <span>Open</span>

                <strong>
                  {dashboardData?.grievances?.open ?? 0}
                </strong>

                <small>Active cases</small>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon">✅</div>

              <div>
                <span>Resolved</span>

                <strong>
                  {dashboardData?.grievances?.resolved ?? 0}
                </strong>

                <small>Resolved cases</small>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon">🔒</div>

              <div>
                <span>Closed</span>

                <strong>
                  {dashboardData?.grievances?.closed ?? 0}
                </strong>

                <small>Closed cases</small>
              </div>
            </div>
          </div>
        </section>

        <section
          className="admin-section"
          id="users-management"
        >
          <div className="section-heading">
            <div>
              <span>USER MANAGEMENT</span>
              <h2>Registered users</h2>
            </div>

            <span className="live-status">
              ● Live Database
            </span>
          </div>

          {roleMessage && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: roleMessage.includes(
                  'successfully'
                )
                  ? '#ecfdf5'
                  : '#fef2f2',
                color: roleMessage.includes(
                  'successfully'
                )
                  ? '#047857'
                  : '#b91c1c',
                border: roleMessage.includes(
                  'successfully'
                )
                  ? '1px solid #a7f3d0'
                  : '1px solid #fecaca',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {roleMessage}
            </div>
          )}

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow:
                '0 8px 30px rgba(15, 23, 42, 0.05)',
            }}
          >
            {usersLoading ? (
              <div
                style={{
                  padding: '30px',
                  textAlign: 'center',
                  color: '#6b7280',
                }}
              >
                Loading users...
              </div>
            ) : adminUsers.length === 0 ? (
              <div
                style={{
                  padding: '35px',
                  textAlign: 'center',
                  color: '#6b7280',
                }}
              >
                No users found in the system.
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
                    minWidth: '760px',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: '#f8fafc',
                        borderBottom:
                          '1px solid #e5e7eb',
                      }}
                    >
                      <th
                        style={{
                          padding: '16px 20px',
                          textAlign: 'left',
                          color: '#475569',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Name
                      </th>

                      <th
                        style={{
                          padding: '16px 20px',
                          textAlign: 'left',
                          color: '#475569',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Email
                      </th>

                      <th
                        style={{
                          padding: '16px 20px',
                          textAlign: 'left',
                          color: '#475569',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Current Role
                      </th>

                      <th
                        style={{
                          padding: '16px 20px',
                          textAlign: 'left',
                          color: '#475569',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Change Role
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {adminUsers.map((adminUser) => (
                      <tr
                        key={adminUser.id}
                        style={{
                          borderBottom:
                            '1px solid #f1f5f9',
                        }}
                      >
                        <td
                          style={{
                            padding: '16px 20px',
                            color: '#111827',
                            fontWeight: 600,
                          }}
                        >
                          {adminUser.name ||
                            'Unnamed user'}
                        </td>

                        <td
                          style={{
                            padding: '16px 20px',
                            color: '#64748b',
                          }}
                        >
                          {adminUser.email}
                        </td>

                        <td
                          style={{
                            padding: '16px 20px',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '5px 10px',
                              borderRadius: '999px',
                              background:
                                adminUser.role ===
                                'admin'
                                  ? '#ede9fe'
                                  : adminUser.role ===
                                    'manager'
                                  ? '#dbeafe'
                                  : adminUser.role ===
                                    'staff'
                                  ? '#dcfce7'
                                  : '#f1f5f9',
                              color:
                                adminUser.role ===
                                'admin'
                                  ? '#6d28d9'
                                  : adminUser.role ===
                                    'manager'
                                  ? '#1d4ed8'
                                  : adminUser.role ===
                                    'staff'
                                  ? '#15803d'
                                  : '#475569',
                              fontSize: '12px',
                              fontWeight: 600,
                              textTransform:
                                'capitalize',
                            }}
                          >
                            {adminUser.role}
                          </span>
                        </td>

                        <td
                          style={{
                            padding: '16px 20px',
                          }}
                        >
                          <select
                            value={adminUser.role}
                            disabled={
                              savingUserId ===
                              adminUser.id
                            }
                            onChange={(event) => {
  const selectedRole = event.target.value

  if (selectedRole === 'manager') {
    setPendingManagerUserId(adminUser.id)
    setSelectedDepartmentId(
      adminUser.department_id || ''
    )
    return
  }

  setPendingManagerUserId(null)
  setSelectedDepartmentId('')

  handleRoleChange(adminUser.id, selectedRole)
}}
                            style={{
                              padding: '8px 12px',
                              border:
                                '1px solid #cbd5e1',
                              borderRadius: '8px',
                              background: '#ffffff',
                              color: '#334155',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor:
                                savingUserId ===
                                adminUser.id
                                  ? 'not-allowed'
                                  : 'pointer',
                              opacity:
                                savingUserId ===
                                adminUser.id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            <option value="student">
                              Student
                            </option>

                            <option value="staff">
                              Staff
                            </option>

                            <option value="manager">
                              Manager
                            </option>

                            <option value="admin">
                              Admin
                            </option>
                          </select>

                          {pendingManagerUserId === adminUser.id && (
  <div style={{ marginTop: '10px' }}>
    <select
      value={selectedDepartmentId}
      onChange={(event) =>
        setSelectedDepartmentId(event.target.value)
      }
      style={{
        padding: '8px',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        width: '100%',
      }}
    >
      <option value="">Select Department</option>

      {departments.map((department) => (
        <option key={department.id} value={department.id}>
          {department.name}
        </option>
      ))}
    </select>

    <button
      onClick={() => {
        handleRoleChange(
          adminUser.id,
          'manager',
          selectedDepartmentId
        )
        setPendingManagerUserId(null)
      }}
      disabled={
        !selectedDepartmentId ||
        savingUserId === adminUser.id
      }
      style={{ marginTop: '8px' }}
    >
      Save Manager
    </button>
  </div>
)}

                          {savingUserId ===
                            adminUser.id && (
                            <span
                              style={{
                                marginLeft: '10px',
                                fontSize: '12px',
                                color: '#64748b',
                              }}
                            >
                              Saving...
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <span>MANAGEMENT</span>
              <h2>Administration modules</h2>
            </div>
          </div>

          <div className="admin-module-grid">
            <article
              className="admin-module"
              onClick={() =>
                navigate('/admin/grievances')
              }
              style={{ cursor: 'pointer' }}
            >
              <div className="module-icon">📋</div>

              <div>
                <h3>Grievance Management</h3>

                <p>
                  Review, monitor, assign and manage
                  institutional grievances.
                </p>
              </div>

              <span className="module-arrow">→</span>
            </article>

            <article
              className="admin-module"
              onClick={scrollToUsers}
              style={{ cursor: 'pointer' }}
            >
              <div className="module-icon">👥</div>

              <div>
                <h3>User Management</h3>

                <p>
                  Manage students, staff, managers
                  and administrative accounts.
                </p>
              </div>

              <span className="module-arrow">→</span>
            </article>

            <article className="admin-module">
              <div className="module-icon">🏢</div>

              <div>
                <h3>Departments</h3>

                <p>
                  Configure departments, routing
                  and responsible teams.
                </p>
              </div>

              <span className="module-arrow">→</span>
            </article>

            <article className="admin-module">
              <div className="module-icon">⚙️</div>

              <div>
                <h3>System Configuration</h3>

                <p>
                  Configure categories, SLA policies
                  and system rules.
                </p>
              </div>

              <span className="module-arrow">→</span>
            </article>

            <article className="admin-module">
              <div className="module-icon">📊</div>

              <div>
                <h3>Reports & Analytics</h3>

                <p>
                  Analyze grievance volume, resolution
                  and department performance.
                </p>
              </div>

              <span className="module-arrow">→</span>
            </article>

            <article className="admin-module">
              <div className="module-icon">🔐</div>

              <div>
                <h3>Audit History</h3>

                <p>
                  Review important system and
                  grievance activity.
                </p>
              </div>

              <span className="module-arrow">→</span>
            </article>
          </div>
        </section>

        <section className="admin-info-panel">
          <div>
            <span className="info-label">
              CURRENT DEVELOPMENT PHASE
            </span>

            <h2>
              Foundation & Role Management
            </h2>

            <p>
              Authentication, role-based access and
              the student grievance workflow are now
              connected. Administrative modules will
              be activated progressively.
            </p>
          </div>

          <div className="phase-badge">
            Phase 1
          </div>
        </section>
      </main>
    </div>
  )
}

export default AdminDashboard