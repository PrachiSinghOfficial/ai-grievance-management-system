import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Notification {
  id: string
  title: string
  message: string
  notification_type: string
  read: boolean
  created_at: string | null
}

function StudentNotifications() {
  const navigate = useNavigate()

  const [notifications, setNotifications] =
    useState<Notification[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    const token =
      localStorage.getItem('access_token')

    if (!token) {
      navigate('/')
      return
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/notifications/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result.detail ||
            'Unable to load notifications.'
        )
      }

      setNotifications(
        result.notifications || []
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load notifications.'
      )
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (
    notificationId: string
  ) => {
    const token =
      localStorage.getItem('access_token')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        return
      }

      setNotifications(
        (previous) =>
          previous.map((notification) =>
            notification.id ===
            notificationId
              ? {
                  ...notification,
                  read: true,
                }
              : notification
          )
      )
    } catch {
      // Keep the current UI state unchanged.
    }
  }

  const formatDate = (
    date: string | null
  ) => {
    if (!date) return '—'

    return new Date(
      date
    ).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
          padding: '25px 50px',
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
        }}
      >

        <div>

          <h1
            style={{
              margin: 0,
              fontSize: '28px',
            }}
          >
            CampusResolve
          </h1>

          <p
            style={{
              margin: '6px 0 0',
              color: '#93c5fd',
            }}
          >
            Student Portal / Notifications
          </p>

        </div>

        <button
          onClick={() =>
            navigate(-1)
          }
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border:
              '1px solid #475569',
            background:
              'transparent',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>

      </header>

      {/* MAIN */}

      <main
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '45px 30px',
        }}
      >

        <div
          style={{
            marginBottom: '30px',
          }}
        >

          <p
            style={{
              color: '#55739a',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '1px',
            }}
          >
            UPDATES
          </p>

          <h2
            style={{
              fontSize: '36px',
              margin: '8px 0',
            }}
          >
            Notifications
          </h2>

          <p
            style={{
              color: '#64748b',
            }}
          >
            Stay updated about your grievances
            and important system activity.
          </p>

        </div>

        {error && (
          <div
            style={{
              background: '#fff1f2',
              border:
                '1px solid #fecdd3',
              color: '#be123c',
              padding: '15px',
              borderRadius: '9px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div
            style={{
              background: 'white',
              padding: '45px',
              borderRadius: '14px',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Loading notifications...
          </div>
        )}

        {!loading &&
          notifications.length === 0 && (
            <div
              style={{
                background: 'white',
                padding: '60px 30px',
                borderRadius: '14px',
                textAlign: 'center',
                border:
                  '1px solid #dbe3ed',
              }}
            >

              <div
                style={{
                  fontSize: '45px',
                  marginBottom: '15px',
                }}
              >
                🔔
              </div>

              <h3>
                No notifications yet
              </h3>

              <p
                style={{
                  color: '#64748b',
                }}
              >
                New updates about your
                grievances will appear here.
              </p>

            </div>
          )}

        {!loading &&
          notifications.map(
            (notification) => (
              <div
                key={notification.id}
                onClick={() =>
                  markAsRead(
                    notification.id
                  )
                }
                style={{
                  background:
                    notification.read
                      ? 'white'
                      : '#eff6ff',
                  border:
                    '1px solid #dbe3ed',
                  borderRadius: '14px',
                  padding: '22px',
                  marginBottom: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >

                {!notification.read && (
                  <span
                    style={{
                      position:
                        'absolute',
                      top: '22px',
                      right: '22px',
                      width: '9px',
                      height: '9px',
                      background:
                        '#2563eb',
                      borderRadius:
                        '50%',
                    }}
                  />
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems:
                      'center',
                    marginBottom:
                      '8px',
                  }}
                >

                  <span
                    style={{
                      fontSize: '20px',
                    }}
                  >
                    🔔
                  </span>

                  <h3
                    style={{
                      margin: 0,
                    }}
                  >
                    {notification.title}
                  </h3>

                </div>

                <p
                  style={{
                    color: '#475569',
                    margin:
                      '8px 0',
                    lineHeight: 1.6,
                  }}
                >
                  {notification.message}
                </p>

                <div
                  style={{
                    color: '#94a3b8',
                    fontSize: '13px',
                  }}
                >
                  {formatDate(
                    notification.created_at
                  )}
                </div>

              </div>
            )
          )}

      </main>

    </div>
  )
}

export default StudentNotifications