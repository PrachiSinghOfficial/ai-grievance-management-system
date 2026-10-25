
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DEFAULT_CATEGORIES = [
  'Hostel',
  'Library',
  'Canteen',
  'IT Support',
  'Classroom',
  'Faculty',
  'General',
]

type Settings = {
  categories: string[]
  slaHours: number
}

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem('admin_settings')

    if (saved) {
      const parsed = JSON.parse(saved)

      return {
        categories: Array.isArray(parsed.categories)
          ? parsed.categories
          : DEFAULT_CATEGORIES,
        slaHours:
          Number(parsed.slaHours) > 0
            ? Number(parsed.slaHours)
            : 48,
      }
    }
  } catch {
    // Use defaults if saved settings cannot be read.
  }

  return {
    categories: [...DEFAULT_CATEGORIES],
    slaHours: 48,
  }
}

export default function AdminSettings() {
  const navigate = useNavigate()
  const [initialSettings] = useState(loadSettings)
  const [categories, setCategories] = useState(
    initialSettings.categories
  )
  const [slaHours, setSlaHours] = useState(initialSettings.slaHours)
  const [newCategory, setNewCategory] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function addCategory() {
    const category = newCategory.trim()

    if (!category) {
      setError('Please enter a category name.')
      return
    }

    if (
      categories.some(
        (item) => item.toLowerCase() === category.toLowerCase()
      )
    ) {
      setError('This category already exists.')
      return
    }

    setCategories([...categories, category])
    setNewCategory('')
    setError('')
    setMessage('')
  }

  function removeCategory(index: number) {
    setCategories(categories.filter((_, i) => i !== index))
    setMessage('')
    setError('')
  }

  function saveSettings() {
    if (!Number.isFinite(slaHours) || slaHours < 1) {
      setError('Escalation time must be at least 1 hour.')
      return
    }

    if (categories.length === 0) {
      setError('Keep at least one grievance category.')
      return
    }

    try {
      localStorage.setItem(
        'admin_settings',
        JSON.stringify({ categories, slaHours })
      )
      setError('')
      setMessage('Settings saved successfully in this browser.')
    } catch {
      setError('Unable to save settings in this browser.')
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

      <h1>⚙️ System Settings</h1>
      <p className="admin-subtitle">
        Configure grievance categories and escalation preferences.
      </p>

      <section className="admin-panel admin-section">
        <h2>🏷️ Grievance Categories</h2>
        <p>
          Add or remove categories in this browser's saved settings.
        </p>

        {categories.map((category, index) => (
          <div className="admin-settings-list" key={`${category}-${index}`}>
            <input
              aria-label={`Category ${index + 1}`}
              value={category}
              onChange={(event) => {
                const updated = [...categories]
                updated[index] = event.target.value
                setCategories(updated)
                setMessage('')
              }}
            />

            <button
              className="admin-button admin-button-danger"
              onClick={() => removeCategory(index)}
              type="button"
            >
              Remove
            </button>
          </div>
        ))}

        <div className="admin-toolbar">
          <input
            aria-label="New category name"
            placeholder="Enter a new category"
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') addCategory()
            }}
            style={{ maxWidth: 350 }}
          />

          <button
            className="admin-button"
            onClick={addCategory}
            type="button"
          >
            + Add Category
          </button>
        </div>
      </section>

      <section className="admin-panel admin-section">
        <h2>⏱️ SLA Policy</h2>
        <p>
          Configure the escalation target displayed in these settings.
        </p>

        <label htmlFor="sla-hours">
          Escalation time (hours)
        </label>

        <input
          id="sla-hours"
          type="number"
          min={1}
          value={slaHours}
          onChange={(event) => {
            setSlaHours(Number(event.target.value))
            setMessage('')
          }}
          style={{ maxWidth: 220 }}
        />

        <p>
          Configured target: <strong>{slaHours} hours</strong>
        </p>
      </section>

      {error && (
        <p className="admin-alert-error admin-section">{error}</p>
      )}

      {message && (
        <p className="admin-alert-success admin-section">{message}</p>
      )}

      <div className="admin-toolbar">
        <button className="admin-button" onClick={saveSettings}>
          Save Settings
        </button>
      </div>

      <p style={{ fontSize: 13 }}>
        Note: These settings are stored in this browser only. They do not
        yet update the backend database or automatically change grievance
        processing.
      </p>
    </div>
  )
}
