import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface ReportData {
  total: number
  summary: {
    open: number
    resolved: number
    closed: number
    rejected: number
    high_priority: number
  }
  status_counts: Record<string, number>
  category_counts: Record<string, number>
  priority_counts: Record<string, number>
}

function ManagerReports() {
  const navigate = useNavigate()

  const [data, setData] =
    useState<ReportData | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const loadReports = async () => {
      const token =
        localStorage.getItem('access_token')

      if (!token) {
        navigate('/')
        return
      }

      try {
        const response = await fetch(
          '/api/manager/reports',
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
              'Unable to load reports.'
          )
        }

        setData(result)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load reports.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [navigate])

  const renderBars = (
    values: Record<string, number>
  ) => {
    const entries =
      Object.entries(values)

    if (entries.length === 0) {
      return (
        <p
          style={{
            color: '#64748b',
          }}
        >
          No data available.
        </p>
      )
    }

    const maxValue = Math.max(
      ...entries.map(
        ([, value]) => value
      ),
      1
    )

    return (
      <div
        style={{
          display: 'grid',
          gap: '16px',
        }}
      >
        {entries.map(
          ([label, value]) => (
            <div key={label}>

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  marginBottom: '6px',
                  fontSize: '14px',
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                  }}
                >
                  {label}
                </span>

                <span
                  style={{
                    color: '#64748b',
                  }}
                >
                  {value}
                </span>
              </div>

              <div
                style={{
                  height: '9px',
                  background: '#e2e8f0',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width:
                      `${(value / maxValue) * 100}%`,
                    height: '100%',
                    background: '#2563eb',
                    borderRadius:
                      '999px',
                  }}
                />
              </div>

            </div>
          )
        )}
      </div>
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
            Manager Portal / Reports & Analytics
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
            ANALYTICS
          </p>

          <h2
            style={{
              fontSize: '36px',
              margin: '8px 0',
            }}
          >
            Reports & Analytics
          </h2>

          <p
            style={{
              color: '#64748b',
            }}
          >
            Overview of grievance activity
            using live database data.
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

        {/* SUMMARY CARDS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(5, 1fr)',
            gap: '14px',
            marginBottom: '25px',
          }}
        >

          {[
            [
              'Total',
              data?.total ?? 0,
            ],
            [
              'Open',
              data?.summary.open ?? 0,
            ],
            [
              'Resolved',
              data?.summary.resolved ?? 0,
            ],
            [
              'Closed',
              data?.summary.closed ?? 0,
            ],
            [
              'High Priority',
              data?.summary.high_priority ?? 0,
            ],
          ].map(
            ([label, value]) => (
              <div
                key={String(label)}
                style={{
                  background: 'white',
                  border:
                    '1px solid #dbe3ed',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >

                <div
                  style={{
                    color: '#64748b',
                    fontSize: '13px',
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    fontSize: '30px',
                    fontWeight: 700,
                    marginTop: '7px',
                  }}
                >
                  {loading
                    ? '—'
                    : value}
                </div>

              </div>
            )
          )}

        </div>

        {/* ANALYTICS GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2, 1fr)',
            gap: '22px',
          }}
        >

          {/* STATUS */}
          <section
            style={{
              background: 'white',
              border:
                '1px solid #dbe3ed',
              borderRadius: '14px',
              padding: '25px',
            }}
          >

            <h3
              style={{
                marginTop: 0,
              }}
            >
              Status Distribution
            </h3>

            {loading
              ? 'Loading...'
              : renderBars(
                  data?.status_counts || {}
                )}

          </section>

          {/* CATEGORY */}
          <section
            style={{
              background: 'white',
              border:
                '1px solid #dbe3ed',
              borderRadius: '14px',
              padding: '25px',
            }}
          >

            <h3
              style={{
                marginTop: 0,
              }}
            >
              Category Distribution
            </h3>

            {loading
              ? 'Loading...'
              : renderBars(
                  data?.category_counts || {}
                )}

          </section>

          {/* PRIORITY */}
          <section
            style={{
              background: 'white',
              border:
                '1px solid #dbe3ed',
              borderRadius: '14px',
              padding: '25px',
            }}
          >

            <h3
              style={{
                marginTop: 0,
              }}
            >
              Priority Distribution
            </h3>

            {loading
              ? 'Loading...'
              : renderBars(
                  data?.priority_counts || {}
                )}

          </section>

          {/* SUMMARY */}
          <section
            style={{
              background: 'white',
              border:
                '1px solid #dbe3ed',
              borderRadius: '14px',
              padding: '25px',
            }}
          >

            <h3
              style={{
                marginTop: 0,
              }}
            >
              Resolution Overview
            </h3>

            <div
              style={{
                display: 'grid',
                gap: '15px',
              }}
            >

              <div
                style={{
                  padding: '15px',
                  background: '#f8fafc',
                  borderRadius: '9px',
                }}
              >
                Resolved Cases:
                <strong>
                  {' '}
                  {data?.summary.resolved ?? 0}
                </strong>
              </div>

              <div
                style={{
                  padding: '15px',
                  background: '#f8fafc',
                  borderRadius: '9px',
                }}
              >
                Closed Cases:
                <strong>
                  {' '}
                  {data?.summary.closed ?? 0}
                </strong>
              </div>

              <div
                style={{
                  padding: '15px',
                  background: '#f8fafc',
                  borderRadius: '9px',
                }}
              >
                Rejected Cases:
                <strong>
                  {' '}
                  {data?.summary.rejected ?? 0}
                </strong>
              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  )
}

export default ManagerReports