import AdminReports from './pages/AdminReports'
import AdminAuditHistory from './pages/AdminAuditHistory'
import AdminSettings from './pages/AdminSettings'
import AdminDepartments from './pages/AdminDepartments';
import { useState } from 'react'
import './admin.css'
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom'

import './App.css'

import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SubmitGrievance from './pages/SubmitGrievance'
import MyGrievances from './pages/MyGrievances'
import GrievanceDetail from './pages/GrievanceDetail'

import AdminDashboard from './pages/AdminDashboard'
import AdminGrievances from './pages/AdminGrievances'
import AdminGrievanceDetail from './pages/AdminGrievanceDetail'

import ManagerDashboard from './pages/ManagerDashboard'
import ManagerGrievances from './pages/ManagerGrievances'
import ManagerGrievanceDetails from './pages/ManagerGrievanceDetails'
import ManagerEscalations from './pages/ManagerEscalations'
import ManagerSLA from './pages/ManagerSLA'
import ManagerReports from './pages/ManagerReports'

import StaffDashboard from './pages/StaffDashboard'
import StaffGrievances from './pages/StaffGrievances'
import StaffGrievanceDetail from './pages/StaffGrievanceDetail'

import Notification from './pages/Notification'


function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setMessage('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.detail || 'Login failed')
        setLoading(false)
        return
      }

      localStorage.setItem(
        'access_token',
        data.access_token
      )

      localStorage.setItem(
        'student',
        JSON.stringify(data.student)
      )

      const role = data.student.role

      if (role === 'admin') {
        navigate('/admin')
      } else if (role === 'manager') {
        navigate('/manager')
      } else if (role === 'staff') {
        navigate('/staff')
      } else {
        navigate('/dashboard')
      }

    } catch (error) {
      console.error(error)
      setMessage('Failed to connect to server')
    }

    setLoading(false)
  }

  return (
    <div className="login-page">

      <div className="login-left">

        <div className="brand-section">

          <div className="brand-icon">
            CR
          </div>

          <h1>
            CampusResolve
          </h1>

          <p className="brand-subtitle">
            AI Grievance Management System
          </p>

        </div>

        <div className="intro-section">

          <h2>
            Resolve. Track. Improve.
          </h2>

          <p>
            A secure digital platform designed to make
            campus grievance management simple,
            transparent and efficient.
          </p>

        </div>

        <div className="feature-list">

          <div className="feature-item">

            <div className="feature-icon">
              ✓
            </div>

            <div>

              <h3>
                Easy Grievance Submission
              </h3>

              <p>
                Submit and manage your campus complaints digitally.
              </p>

            </div>

          </div>

          <div className="feature-item">

            <div className="feature-icon">
              ◷
            </div>

            <div>

              <h3>
                Track Your Grievances
              </h3>

              <p>
                Follow the status and progress of every complaint.
              </p>

            </div>

          </div>

          <div className="feature-item">

            <div className="feature-icon">
              ✦
            </div>

            <div>

              <h3>
                AI-Assisted Management
              </h3>

              <p>
                AI helps identify category, urgency and priority.
              </p>

            </div>

          </div>

          <div className="feature-item">

            <div className="feature-icon">
              🔒
            </div>

            <div>

              <h3>
                Secure & Transparent
              </h3>

              <p>
                Role-based access keeps grievance data protected.
              </p>

            </div>

          </div>

        </div>

        <div className="login-left-footer">

          <span>
            AI Grievance Management System
          </span>

          <span>
            •
          </span>

          <span>
            CampusResolve
          </span>

        </div>

      </div>


      <div className="login-right">

        <div className="login-box">

          <div className="login-heading">

            <h2>
              Welcome Back
            </h2>

            <p>
              Sign in to your CampusResolve account
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="login-form"
          >

            <div className="input-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

            <div className="input-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>

            {message && (
              <div className="login-error">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? 'Logging in...'
                : 'Login'}
            </button>

          </form>

          <div className="register-section">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              className="register-button"
              onClick={() =>
                navigate('/register')
              }
            >
              Create an account
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
            AUTHENTICATION
        ========================= */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            STUDENT
        ========================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/submit-grievance"
          element={<SubmitGrievance />}
        />

        <Route
          path="/my-grievances"
          element={<MyGrievances />}
        />

        <Route
          path="/grievance/:id"
          element={<GrievanceDetail />}
        />

        <Route
          path="/student/notifications"
          element={<Notification />}
        />


        {/* =========================
            ADMIN
        ========================= */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/grievances"
          element={<AdminGrievances />}
        />

        <Route
          path="/admin/grievances/:id"
          element={<AdminGrievanceDetail />}
        />
        <Route
  path="/admin/departments"
  element={<AdminDepartments />}
/>
<Route
  path="/admin/settings"
  element={<AdminSettings />}
/>
<Route path="/admin/reports" element={<AdminReports />} />
<Route path="/admin/audit-history" element={<AdminAuditHistory />} />


        {/* =========================
            STAFF
        ========================= */}

        <Route
          path="/staff"
          element={<StaffDashboard />}
        />

        <Route
          path="/staff/grievances"
          element={<StaffGrievances />}
        />

        <Route
          path="/staff/grievances/:id"
          element={<StaffGrievanceDetail />}
        />


        {/* =========================
            MANAGER
        ========================= */}

        <Route
          path="/manager"
          element={<ManagerDashboard />}
        />

        <Route
          path="/manager/grievances"
          element={<ManagerGrievances />}
        />

        <Route
          path="/manager/grievances/:id"
          element={<ManagerGrievanceDetails />}
        />

        <Route
          path="/manager/escalations"
          element={<ManagerEscalations />}
        />

        <Route
          path="/manager/sla"
          element={<ManagerSLA />}
        />

        <Route
          path="/manager/reports"
          element={<ManagerReports />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App

