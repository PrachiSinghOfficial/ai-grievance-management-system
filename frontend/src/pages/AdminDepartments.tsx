
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://127.0.0.1:8000'

type Department = {
  _id?: string
  id?: string
  name?: string
  department_name?: string
  description?: string
  status?: string
}

export default function AdminDepartments() {
  const navigate = useNavigate()

  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  async function loadDepartments() {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('access_token')

      if (!token) {
        throw new Error('Login session not found. Please log in again.')
      }

      const response = await fetch(`${API_URL}/admin/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`Unable to load departments (${response.status}).`)
      }

      const data = await response.json()

      setDepartments(
        Array.isArray(data) ? data : data.departments ?? []
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load departments.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  async function handleAddDepartment(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const token = localStorage.getItem('access_token')

    if (!token) {
      setError('Login session not found. Please log in again.')
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`${API_URL}/admin/departments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || `Unable to add department (${response.status}).`
        )
      }

      setSuccess('Department added successfully!')
      setName('')
      setDescription('')
      setShowForm(false)

      await loadDepartments()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to add department.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <button
        className="admin-button admin-button-secondary"
        onClick={() => navigate('/admin')}
      >
        ← Back to Dashboard
      </button>

      <h1>🏢 Departments</h1>
      <p className="admin-subtitle">
        Manage departments responsible for handling campus grievances.
      </p>

      <div className="admin-toolbar">
        <div>
          <h2 style={{ marginBottom: 4 }}>Department Directory</h2>
          <p style={{ margin: 0 }}>Registered departments in the system</p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="admin-badge">
            {departments.length} Department
            {departments.length !== 1 ? 's' : ''}
          </span>

          <button
            className="admin-button"
            onClick={() => {
              setShowForm(!showForm)
              setError('')
              setSuccess('')
            }}
          >
            {showForm ? 'Cancel' : '+ Add Department'}
          </button>
        </div>
      </div>

      {showForm && (
        <section className="admin-panel admin-section">
          <h2>Add New Department</h2>

          <form onSubmit={handleAddDepartment}>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="department-name">Department Name *</label>
              <input
                id="department-name"
                className="admin-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Information Technology"
                required
                maxLength={100}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: 8,
                  padding: 12,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="department-description">Description</label>
              <textarea
                id="department-description"
                className="admin-input"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the department's responsibilities"
                rows={3}
                maxLength={500}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: 8,
                  padding: 12,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              className="admin-button"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Department'}
            </button>
          </form>
        </section>
      )}

      {success && (
        <div className="admin-panel" role="status">
          {success}
        </div>
      )}

      {error && (
        <div className="admin-alert-error" role="alert">
          <strong>Department operation failed</strong>
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="admin-panel">
          <p>Loading departments...</p>
        </div>
      )}

      {!loading && !error && departments.length === 0 && (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">🏢</div>
          <h2>No Departments Yet</h2>
          <p>Add your first department using the button above.</p>
        </div>
      )}

      {!loading && departments.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Department</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {departments.map((department, index) => (
                <tr key={department._id ?? department.id ?? index}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>
                      {department.name ??
                        department.department_name ??
                        'Department'}
                    </strong>
                  </td>
                  <td>{department.description || '—'}</td>
                  <td>
                    <span
                      className={
                        department.status?.toLowerCase() === 'inactive'
                          ? 'admin-badge admin-badge-warning'
                          : 'admin-badge admin-badge-success'
                      }
                    >
                      {department.status ?? 'Registered'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
