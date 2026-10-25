
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Notification.css'


interface NotificationItem {
  id: string
  title: string
  message: string
  notification_type: string
  read: boolean
  created_at: string | null
}

function Notification() {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const fetchNotifications = async () => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      navigate('/')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        '/api/notifications/me',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('student')
        navigate('/')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to load notifications')
      }

      const data = await response.json()

      setNotifications(data.notifications || [])
    } catch (err) {
      console.error(
        'Error loading notifications:',
        err
      )

      setError(
        'Unable to load notifications. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAsRead = async (
    notificationId: string
  ) => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      navigate('/')
      return
    }

    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('student')
        navigate('/')
        return
      }

      if (!response.ok) {
        throw new Error(
          'Failed to mark notification as read'
        )
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      )
    } catch (err) {
      console.error(
        'Error marking notification as read:',
        err
      )
    }
  }

  const formatDate = (
    date: string | null
  ) => {
    if (!date) {
      return ''
    }

    const notificationDate = new Date(date)

    return notificationDate.toLocaleString(
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

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length

  return (
    <div className="notification-page">

      <div className="notification-container">

        <div className="notification-header">

          <div>
            <p className="notification-eyebrow">
              STUDENT WORKSPACE
            </p>

            <h1>
              Notifications
            </h1>

            <p>
              Stay updated with your grievance activity.
            </p>
          </div>

          <button
            className="back-button"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            ← Dashboard
          </button>

        </div>


        <div className="notification-summary">

          <div className="notification-summary-icon">
            🔔
          </div>

          <div>
            <strong>
              {notifications.length}
            </strong>

            <span>
              Total notifications
            </span>
          </div>

          <div className="notification-summary-divider" />

          <div>
            <strong>
              {unreadCount}
            </strong>

            <span>
              Unread
            </span>
          </div>

        </div>


        {loading && (

          <div className="notification-empty">

            <div className="notification-empty-icon">
              ⏳
            </div>

            <h2>
              Loading notifications...
            </h2>

            <p>
              Please wait while we load your notifications.
            </p>

          </div>

        )}


        {!loading && error && (

          <div className="notification-empty">

            <div className="notification-empty-icon">
              ⚠️
            </div>

            <h2>
              Something went wrong
            </h2>

            <p>
              {error}
            </p>

            <button
              className="notification-action"
              onClick={fetchNotifications}
            >
              Try again
            </button>

          </div>

        )}


        {!loading &&
          !error &&
          notifications.length === 0 && (

            <div className="notification-empty">

              <div className="notification-empty-icon">
                🔔
              </div>

              <h2>
                No notifications yet
              </h2>

              <p>
                You don't have any notifications right now.
              </p>

              <button
                className="notification-action"
                onClick={() =>
                  navigate('/dashboard')
                }
              >
                Back to dashboard
              </button>

            </div>

          )}


        {!loading &&
          !error &&
          notifications.length > 0 && (

            <div className="notification-list">

              {notifications.map(
                (notification) => (

                  <div
                    key={notification.id}
                    className={
                      notification.read
                        ? 'notification-card read'
                        : 'notification-card unread'
                    }
                  >

                    <div className="notification-card-icon">
                      {notification.notification_type ===
                      'grievance'
                        ? '📋'
                        : '🔔'}
                    </div>


                    <div className="notification-card-content">

                      <div className="notification-card-top">

                        <h3>
                          {notification.title}
                        </h3>

                        {!notification.read && (
                          <span className="unread-badge">
                            NEW
                          </span>
                        )}

                      </div>


                      <p>
                        {notification.message}
                      </p>


                      <div className="notification-card-bottom">

                        <span className="notification-date">
                          {formatDate(
                            notification.created_at
                          )}
                        </span>


                        {!notification.read && (

                          <button
                            className="read-button"
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                          >
                            Mark as read
                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

      </div>

    </div>
  )
}

export default Notification

