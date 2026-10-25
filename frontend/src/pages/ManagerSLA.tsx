import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface SLACase {
  id: string
  title: string
  category: string
  status: string
  priority: string
  created_at?: string
  age_hours: number
  sla_status: string
}

interface SLAResponse {
  sla_cases: SLACase[]
  total: number
  overdue: number
  approaching: number
  within_sla: number
}

function ManagerSLA() {
  const navigate = useNavigate()

  const [data, setData] =
    useState<SLAResponse | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const loadSLA = async () => {
      const token =
        localStorage.getItem('access_token')

      if (!token) {
        navigate('/')
        return
      }

      try {
        const response = await fetch(
          '/api/manager/sla',
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
              'Unable to load SLA data.'
          )
        }

        setData(result)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load SLA data.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadSLA()
  }, [navigate])

  const formatDate = (date?: string) => {
    if (!date) return '—'

    return new Date(date).toLocaleString(
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

  const getStatusStyle = (
    status: string
  ) => {
    if (status === 'Overdue') {
      return {
        background: '#fee2e2',
        color: '#b91c1c',
      }
    }

    if (status === 'Approaching SLA') {
      return {
        background: '#ffedd5',
        color: '#c2410c',
      }
    }

    return {
      background: '#dcfce7',
      color: '#15803d',
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
          padding: '26px 50px',
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
            Manager Portal / SLA Monitoring
          </p>

        </div>

        <button
          onClick={() =>
            navigate(
              '/manager/dashboard'
            )
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
            OPERATIONS
          </p>

          <h2
            style={{
              fontSize: '36px',
              margin: '8px 0',
            }}
          >
            SLA Monitoring
          </h2>

          <p
            style={{
              color: '#64748b',
            }}
          >
            Monitor unresolved grievances
            against the 48-hour resolution SLA.
          </p>

        </div>

        {/* ERROR */}
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

        {/* SUMMARY */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, 1fr)',
            gap: '18px',
            marginBottom: '25px',
          }}
        >

          <div
            style={{
              background: '#dcfce7',
              borderRadius: '14px',
              padding: '24px',
            }}
          >

            <span
              style={{
                color: '#166534',
                fontSize: '14px',
              }}
            >
              Within SLA
            </span>

            <div
              style={{
                fontSize: '34px',
                fontWeight: 700,
                color: '#15803d',
                marginTop: '6px',
              }}
            >
              {loading
                ? '—'
                : data?.within_sla ?? 0}
            </div>

          </div>

          <div
            style={{
              background: '#ffedd5',
              borderRadius: '14px',
              padding: '24px',
            }}
          >

            <span
              style={{
                color: '#9a3412',
                fontSize: '14px',
              }}
            >
              Approaching SLA
            </span>

            <div
              style={{
                fontSize: '34px',
                fontWeight: 700,
                color: '#c2410c',
                marginTop: '6px',
              }}
            >
              {loading
                ? '—'
                : data?.approaching ?? 0}
            </div>

          </div>

          <div
            style={{
              background: '#fee2e2',
              borderRadius: '14px',
              padding: '24px',
            }}
          >

            <span
              style={{
                color: '#991b1b',
                fontSize: '14px',
              }}
            >
              Overdue
            </span>

            <div
              style={{
                fontSize: '34px',
                fontWeight: 700,
                color: '#b91c1c',
                marginTop: '6px',
              }}
            >
              {loading
                ? '—'
                : data?.overdue ?? 0}
            </div>

          </div>

        </div>

        {/* CASE LIST */}
        <section
          style={{
            background: 'white',
            border:
              '1px solid #dbe3ed',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >

          <div
            style={{
              padding: '22px 25px',
              borderBottom:
                '1px solid #e2e8f0',
            }}
          >

            <h3
              style={{
                margin: 0,
              }}
            >
              Active SLA Cases
            </h3>

          </div>

          {loading && (
            <div
              style={{
                padding: '45px',
                textAlign: 'center',
                color: '#64748b',
              }}
            >
              Loading SLA data...
            </div>
          )}

          {!loading &&
            data?.sla_cases.length === 0 && (
              <div
                style={{
                  padding: '55px',
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
                  No active SLA cases
                </h3>

                <p
                  style={{
                    color: '#64748b',
                  }}
                >
                  All current grievances are
                  resolved or no active cases
                  require monitoring.
                </p>

              </div>
            )}

          {!loading &&
            data &&
            data.sla_cases.length > 0 &&
            data.sla_cases.map(
              (item) => {

                const style =
                  getStatusStyle(
                    item.sla_status
                  )

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '22px 25px',
                      borderBottom:
                        '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      gap: '20px',
                      alignItems: 'center',
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
                            ...style,
                            padding:
                              '5px 10px',
                            borderRadius:
                              '999px',
                            fontSize:
                              '12px',
                            fontWeight:
                              700,
                          }}
                        >
                          {item.sla_status}
                        </span>

                        <span
                          style={{
                            color:
                              '#64748b',
                            fontSize:
                              '13px',
                          }}
                        >
                          {item.category}
                        </span>

                      </div>

                      <h3
                        style={{
                          margin:
                            '7px 0',
                        }}
                      >
                        {item.title}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color:
                            '#64748b',
                          fontSize:
                            '14px',
                        }}
                      >
                        Status: {item.status}
                        {' • '}
                        Priority: {item.priority}
                      </p>

                      <p
                        style={{
                          margin:
                            '8px 0 0',
                          color:
                            '#94a3b8',
                          fontSize:
                            '13px',
                        }}
                      >
                        Submitted:{' '}
                        {formatDate(
                          item.created_at
                        )}
                        {' • '}
                        Age:{' '}
                        {item.age_hours} hours
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          `/manager/grievances/${item.id}`
                        )
                      }
                      style={{
                        padding:
                          '10px 16px',
                        borderRadius:
                          '8px',
                        border: 'none',
                        background:
                          '#2563eb',
                        color: 'white',
                        cursor:
                          'pointer',
                        fontWeight:
                          600,
                      }}
                    >
                      Review →
                    </button>

                  </div>
                )
              }
            )}

        </section>

      </main>

    </div>
  )
}

export default ManagerSLA