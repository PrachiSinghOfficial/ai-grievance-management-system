import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SubmitGrievance.css'

function SubmitGrievance() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [department, setDepartment] = useState('')
  const [description, setDescription] = useState('')
  const [anonymous, setAnonymous] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [attachment, setAttachment] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const token = localStorage.getItem('access_token')

      if (!token) {
        throw new Error('Your session has expired. Please sign in again.')
      }

      const formData = new FormData();

formData.append('title', title);
formData.append('category', category);
formData.append('department', department);
formData.append('description', description);
formData.append('anonymous', String(anonymous));
formData.append('force_submit', 'false')

// Add the selected file if one exists.
// Make sure `attachment` matches your file input state variable.
if (attachment) {
  formData.append('attachment', attachment);
}

let response = await fetch(
  '/api/grievances/with-attachment',
  {
    method: 'POST',

    headers: {
      Authorization: `Bearer ${token}`,
    },

    body: formData,
  }
)
      const responseText = await response.text()

let data: any = {}

try {
  data = responseText ? JSON.parse(responseText) : {}
} catch {
  data = { detail: responseText || 'Server returned an unreadable response.' }
}
if (data.duplicate) {

  const existing = data.similar_grievance

  const confirmSubmit = window.confirm(
    `A similar grievance already exists!\n\n` +
    `Title: ${existing.title}\n` +
    `Status: ${existing.status}\n` +
    `Similarity: ${existing.similarity}%\n\n` +
    `Do you still want to submit your grievance?`
  )

  if (!confirmSubmit) {
    setError('Submission cancelled. Similar grievance already exists.')
    return
  }

  formData.set('force_submit', 'true')

  response = await fetch(
    '/api/grievances/with-attachment',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  )

  const retryText = await response.text()

  try {
    data = retryText ? JSON.parse(retryText) : {}
  } catch {
    data = { detail: 'Server returned an unreadable response.' }
  }
}
      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to submit grievance.'
        )
      }

      setSuccess(
        `Grievance submitted successfully! ID: ${data.grievance_id}`
      )

      setTitle('')
      setCategory('')
      setDescription('')
      setAnonymous(false)

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="submit-page">

      <header className="submit-header">

        <button
          className="back-button"
          onClick={() => navigate('/dashboard')}
        >
          ← Dashboard
        </button>

        <div className="submit-brand">
          <div className="submit-logo">
            🛡️
          </div>

          <div>
            <h2>CampusResolve</h2>
            <span>Student Portal</span>
          </div>
        </div>

      </header>


      <main className="submit-main">

        <div className="submit-intro">

          <p className="submit-eyebrow">
            CAMPUS CARE / 02
          </p>

          <h1>
            Tell us what
            <br />
            needs attention.
          </h1>

          <p>
            Share your concern with the appropriate campus
            team. Your grievance will be tracked from
            submission to resolution.
          </p>

        </div>


        <section className="grievance-card">

          <div className="form-header">

            <div>
              <h2>Submit a grievance</h2>

              <p>
                Please provide clear and accurate information.
              </p>
            </div>

            <span className="required-note">
              * Required
            </span>

          </div>


          {error && (
            <div className="form-message error">
              {error}
            </div>
          )}


          {success && (
            <div className="form-message success">
              {success}
            </div>
          )}


          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label htmlFor="title">
                What is your concern? *
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Issue with hostel water supply"
                required
              />

            </div>


            <div className="form-group">

              <label htmlFor="category">
                Category *
              </label>

              <select
                id="category"
                value={category}
                onChange={(e) => {
  const selectedCategory = e.target.value
  setCategory(selectedCategory)

  const departmentMap: Record<string, string> = {
    'Hostel': 'Hostel Department',
    'Library': 'Library Department',
    'Canteen': 'Canteen Department',
    'IT / Technology': 'information technology',
    'Classroom': 'Academic Department',
    'Faculty': 'Faculty Affairs',
    'Administration': 'General Administration',
    'Other': 'General Administration',
  }

  setDepartment(departmentMap[selectedCategory] || '')
}}
                required
              >

                <option value="">
                  Select a category
                </option>

                <option value="Hostel">
                  Hostel
                </option>

                <option value="Library">
                  Library
                </option>

                <option value="Canteen">
                  Canteen
                </option>

                <option value="IT / Technology">
                  IT / Technology
                </option>

                <option value="Classroom">
                  Classroom
                </option>

                <option value="Faculty">
                  Faculty
                </option>

                <option value="Administration">
                  Administration
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

            <div className="form-group">
  <label htmlFor="department">Department *</label>

  <select
    id="department"
    value={department}
    onChange={(e) => setDepartment(e.target.value)}
    required
  >
    <option value="">Select a department</option>
    <option value="Hostel Department">Hostel Department</option>
    <option value="Library Department">Library Department</option>
    <option value="Canteen Department">Canteen Department</option>
    <option value="information technology">
      Information Technology
    </option>
    <option value="Academic Department">Academic Department</option>
    <option value="Faculty Affairs">Faculty Affairs</option>
    <option value="General Administration">
      General Administration
    </option>
  </select>
</div>


            <div className="form-group">

              <label htmlFor="description">
                Describe your concern *
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened, when it happened, and how it is affecting you..."
                rows={7}
                required
              />

              <small>
                Please avoid sharing unnecessary sensitive information.
              </small>

            </div>


            <div className="privacy-option">

              <label>

                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) =>
                    setAnonymous(e.target.checked)
                  }
                />

                <span>
                  <strong>Submit anonymously</strong>

                  <small>
                    Your identity will be hidden from
                    regular grievance viewers.
                  </small>
                </span>

              </label>

            </div>


            <div className="ai-notice">

              <div className="ai-icon">
                ✦
              </div>

              <div>

                <strong>
                  AI-assisted review
                </strong>

                <p>
                  After submission, CampusResolve can
                  analyze the grievance to suggest its
                  priority and routing category.
                </p>

              </div>

            </div>


            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>

              <div>
  <label htmlFor="attachment">Attach a file (optional)</label>

  <input
    id="attachment"
    type="file"
    accept=".jpg,.jpeg,.png,.pdf"
    onChange={(e) =>
      setAttachment(e.target.files?.[0] ?? null)
    }
  />
</div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading
                  ? 'Submitting...'
                  : 'Submit grievance'}

                <span>→</span>
              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  )
}

export default SubmitGrievance