import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Escalation {
  id: string
  title: string
  category: string
  description: string
  status: string
  priority: string
  anonymous: boolean
  created_at?: string
}

function ManagerEscalations() {
  const navigate = useNavigate()

  const [escalations, setEscalations] =
    useState<Escalation[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadEscalations = async () => {
      const token =
        localStorage.getItem('access_token')

      if (!token) {
        navigate('/')
        return
      }

      try {
        const response = await fetch(
          'http://127.0.0.1:8000/manager/escalations',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail ||
              'Unable to load escalations.'
          )
        }

        setEscalations(
          data.escalations || []
        )
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load escalations.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadEscalations()
  }, [navigate])

  const formatDate = (date?: string) => {
    if (!date) return '—'

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
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
          padding: '26px 50px',
          display: 'flex',
          justifyContent: 'space-between',
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
            Manager Portal / Escalations
          </p>
        </div>

        <button
          onClick={() =>
            navigate('/manager/dashboard')
          }
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border:
              '1px solid #475569',
            background: 'transparent',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          ← Dashboard
        </button>
      </header>

      {/* MAIN */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '45px 40px',
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
            MANAGEMENT
          </p>

          <h2
            style={{
              fontSize: '36px',
              margin: '8px 0',
            }}
          >
            Escalated Grievances
          </h2>

          <p
            style={{
              color: '#64748b',
            }}
          >
            High and critical unresolved grievances
            requiring manager attention.
          </p>
        </div>

        {/* SUMMARY */}
        <div
          style={{
            background: 'white',
            border:
              '1px solid #dbe3ed',
            borderRadius: '14px',
            padding: '24px',
            marginBottom: '25px',
          }}
        >
          <span
            style={{
              color: '#64748b',
              fontSize: '14px',
            }}
          >
            Active Escalations
          </span>

          <div
            style={{
              fontSize: '34px',
              fontWeight: 700,
              marginTop: '6px',
            }}
          >
            {loading
              ? '—'
              : escalations.length}
          </div>
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

        {/* LOADING */}
        {loading && (
          <div
            style={{
              background: 'white',
              borderRadius: '14px',
              padding: '35px',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Loading escalations...
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          escalations.length === 0 && (
            <div
              style={{
                background: 'white',
                border:
                  '1px solid #dbe3ed',
                borderRadius: '14px',
                padding: '50px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '40px',
                  marginBottom: '12px',
                }}
              >
                ✓
              </div>

              <h3>
                No active escalations
              </h3>

              <p
                style={{
                  color: '#64748b',
                }}
              >
                There are currently no high or
                critical unresolved grievances.
              </p>
            </div>
          )}

        {/* LIST */}
        {!loading &&
          escalations.length > 0 && (
            <div
              style={{
                display: 'grid',
                gap: '16px',
              }}
            >
              {escalations.map(
                (grievance) => (
                  <div
                    key={grievance.id}
                    style={{
                      background: 'white',
                      border:
                        '1px solid #dbe3ed',
                      borderRadius: '14px',
                      padding: '24px',
                    }}
                  >

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        gap: '20px',
                      }}
                    >

                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems:
                              'center',
                            marginBottom:
                              '8px',
                          }}
                        >
                          <span
                            style={{
                              background:
                                grievance.priority ===
                                'Critical'
                                  ? '#fee2e2'
                                  : '#ffedd5',
                              color:
                                grievance.priority ===
                                'Critical'
                                  ? '#b91c1c'
                                  : '#c2410c',
                              padding:
                                '5px 10px',
                              borderRadius:
                                '999px',
                              fontSize:
                                '12px',
                              fontWeight: 700,
                            }}
                          >
                            {grievance.priority}
                          </span>

                          <span
                            style={{
                              color:
                                '#64748b',
                              fontSize:
                                '13px',
                            }}
                          >
                            {grievance.category}
                          </span>
                        </div>

                        <h3
                          style={{
                            margin:
                              '8px 0',
                            fontSize:
                              '20px',
                          }}
                        >
                          {grievance.title}
                        </h3>

                        <p
                          style={{
                            color:
                              '#64748b',
                            lineHeight:
                              1.5,
                            margin:
                              '8px 0',
                          }}
                        >
                          {grievance.description}
                        </p>

                        <div
                          style={{
                            color:
                              '#94a3b8',
                            fontSize:
                              '13px',
                            marginTop:
                              '12px',
                          }}
                        >
                          Submitted:{' '}
                          {formatDate(
                            grievance.created_at
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection:
                            'column',
                          alignItems:
                            'flex-end',
                          justifyContent:
                            'space-between',
                        }}
                      >

                        <span
                          style={{
                            background:
                              '#f1f5f9',
                            padding:
                              '6px 10px',
                            borderRadius:
                              '7px',
                            fontSize:
                              '13px',
                          }}
                        >
                          {grievance.status}
                        </span>

                        <button
                          onClick={() =>
                            navigate(
                              `/manager/grievances/${grievance.id}`
                            )
                          }
                          style={{
                            marginTop:
                              '20px',
                            padding:
                              '10px 16px',
                            borderRadius:
                              '8px',
                            border:
                              'none',
                            background:
                              '#2563eb',
                            color:
                              'white',
                            cursor:
                              'pointer',
                            fontWeight:
                              600,
                          }}
                        >
                          Review →
                        </button>

                      </div>

                    </div>

                  </div>
                )
              )}
            </div>
          )}

      </main>
    </div>
  )
}

export default ManagerEscalations