
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import './App.css'

const API_URL = 'http://localhost:4000/api'

type AnalyticsEvent = {
  
  
  _id: string
  sessionId: string
  eventType: 'page_view' | 'click'
  pageUrl: string
  timestamp: string
  x?: number
  y?: number
}
type HeatmapClick = {
  sessionId: string
  pageUrl: string
  timestamp: string
  x: number
  y: number
   viewportWidth?: number
   viewportHeight?: number
}

type ClicksResponse = {
  success: boolean
  pageUrl: string
  count: number
  clicks: HeatmapClick[]
}


type Session = {
  sessionId: string
  totalEvents: number
  firstEventAt: string
  lastEventAt: string
}

type ApiSessionsResponse = {
  success: boolean
  count: number
  sessions: Session[]
}

type ApiEventsResponse = {
  success: boolean
  sessionId: string
  count: number
  events: AnalyticsEvent[]
}

const CHART_COLORS = ['#625cf0', '#0ba995']

const tooltipStyle = {
  border: '1px solid #e8ecf4',
  borderRadius: '10px',
  boxShadow: '0 8px 24px rgba(31, 43, 82, 0.08)',
  fontSize: '12px',
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown time'
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatDuration(start: string, end: string) {
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return '—'
  }

  const seconds = Math.max(0, Math.floor((endTime - startTime) / 1000))
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}m ${remainingSeconds}s`
}

function eventLabel(eventType: AnalyticsEvent['eventType']) {
  return eventType === 'page_view' ? 'Page viewed' : 'Click recorded'
}
function normalizePageUrl(pageUrl: string) {
  const path = pageUrl.split('?')[0]

  if (path === '/' || path === '/index.html') {
    return '/'
  }

  return path
}

function getPageLabel(pageUrl: string) {
  const path = normalizePageUrl(pageUrl)

  if (path === '/') return 'Home'
  if (path.endsWith('/product.html')) return 'Products'
  if (path.endsWith('/about.html')) return 'About'

  return path
}
function App() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [allEvents, setAllEvents] = useState<AnalyticsEvent[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<AnalyticsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [error, setError] = useState('')
  const [heatmapPage, setHeatmapPage] = useState('')
  const [heatmapClicks, setHeatmapClicks] = useState<HeatmapClick[]>([])
  const [heatmapLoading, setHeatmapLoading] = useState(false)
  const [heatmapError, setHeatmapError] = useState('')
  const heatmapPreviewUrls: Record<string, string> = {
  "/": "http://localhost:5500/",
  "/index.html": "http://localhost:5500/index.html",
  "/product.html": "http://localhost:5500/product.html",
  "/about.html": "http://localhost:5500/about.html",
}

const heatmapPages = useMemo(
  () =>
    Array.from(
      new Set(
        allEvents
          .filter((event) => event.eventType === 'click')
          .map((event) => normalizePageUrl(event.pageUrl)),
      ),
    ),
  [allEvents],
)

    
  
  

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/sessions`)

      if (!response.ok) {
        throw new Error('Could not load sessions from the backend.')
      }

      const data: ApiSessionsResponse = await response.json()
      const fetchedSessions = data.sessions ?? []

      setSessions(fetchedSessions)

      setSelectedSessionId((currentId) => {
        if (
          currentId &&
          fetchedSessions.some((session) => session.sessionId === currentId)
        ) {
          return currentId
        }

        return fetchedSessions[0]?.sessionId ?? null
      })

      const eventResponses = await Promise.all(
        fetchedSessions.map(async (session) => {
          const result = await fetch(
            `${API_URL}/sessions/${encodeURIComponent(session.sessionId)}/events`,
          )

          if (!result.ok) {
            throw new Error(`Could not load events for ${session.sessionId}.`)
          }

          const eventData: ApiEventsResponse = await result.json()
          return eventData.events ?? []
        }),
      )

      setAllEvents(eventResponses.flat())
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      )
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    void loadAnalytics()
  }, [loadAnalytics])

  useEffect(() => {
    if (!selectedSessionId) {
      setSelectedEvents([])
      return
    }

    let cancelled = false

    async function loadTimeline() {

  if (!selectedSessionId) {
    return;
  }

      try {
        setTimelineLoading(true)

        const response = await fetch(
          `${API_URL}/sessions/${encodeURIComponent(selectedSessionId)}/events`,
        )

        if (!response.ok) {
          throw new Error('Could not load this session timeline.')
        }

        const data: ApiEventsResponse = await response.json()

        if (!cancelled) {
          setSelectedEvents(data.events ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Could not load the timeline.',
          )
        }
      } finally {
        if (!cancelled) {
          setTimelineLoading(false)
        }
      }
    }

    void loadTimeline()

    return () => {
      cancelled = true
    }
  }, [selectedSessionId])
useEffect(() => {
  if (!heatmapPages.length) {
    setHeatmapPage('')
    setHeatmapClicks([])
    return
  }

  if (!heatmapPages.includes(heatmapPage)) {
    setHeatmapPage(heatmapPages[0])
  }
}, [heatmapPages, heatmapPage])

useEffect(() => {
  if (!heatmapPage) {
    setHeatmapClicks([])
    return
  }

  const controller = new AbortController()

  async function loadHeatmap() {
    try {
      setHeatmapLoading(true)
      setHeatmapError('')

      const response = await fetch(
        `${API_URL}/events/clicks?pageUrl=${encodeURIComponent(heatmapPage)}`,
        { signal: controller.signal },
      )

      if (!response.ok) {
        throw new Error('Could not load click coordinates.')
      }

      const data: ClicksResponse = await response.json()
      setHeatmapClicks(data.clicks ?? [])
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return

      setHeatmapError(
        err instanceof Error ? err.message : 'Could not load heatmap.',
      )
    } finally {
      if (!controller.signal.aborted) {
        setHeatmapLoading(false)
      }
    }
  }

  void loadHeatmap()

  return () => controller.abort()
}, [heatmapPage])
  const selectedSession =
    sessions.find((session) => session.sessionId === selectedSessionId) ?? null

  const totalEvents = sessions.reduce(
    (total, session) => total + session.totalEvents,
    0,
  )

  const pageViews = allEvents.filter(
    (event) => event.eventType === 'page_view',
  ).length

  const totalClicks = allEvents.filter(
    (event) => event.eventType === 'click',
  ).length

  const trackedPages = new Set(allEvents.map((event) => event.pageUrl)).size

  const eventDistribution = useMemo(
    () =>
      [
        { name: 'Page views', value: pageViews },
        { name: 'Clicks', value: totalClicks },
      ].filter((item) => item.value > 0),
    [pageViews, totalClicks],
  )

  const pageClickData = useMemo(() => {
    const counts = new Map<string, number>()

    allEvents
      .filter((event) => event.eventType === 'click')
      .forEach((event) => {
        const page = normalizePageUrl(event.pageUrl)
        counts.set(page, (counts.get(page) ?? 0) + 1)
      })

    return Array.from(counts, ([page, clicks]) => ({ page, clicks })).sort(
      (a, b) => b.clicks - a.clicks,
    )
  }, [allEvents])

  const recentClicks = useMemo(
    () =>
      selectedEvents.filter(
        (event) =>
          event.eventType === 'click' &&
          typeof event.x === 'number' &&
          typeof event.y === 'number',
      ),
    [selectedEvents],
  )

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div className="header-copy">
          <p className="eyebrow">ANALYTICS OVERVIEW</p>
          <h1>User Analytics</h1>
          <p className="subtitle">
            Understand how visitors interact with your website.
          </p>
        </div>

        <div className="header-actions">
          <span className={`status ${loading ? 'loading-status' : ''}`}>
            {loading ? 'Updating data' : 'API connected'}
          </span>

          <button
            type="button"
            className="refresh-button"
            onClick={() => void loadAnalytics()}
            disabled={loading}
          >
            <span aria-hidden="true">↻</span>
            Refresh data
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <span aria-hidden="true">!</span>
          <div>
            <strong>Unable to load all analytics.</strong>
            <div>{error} Check that the backend is running on port 4000.</div>
          </div>
        </div>
      )}

      <section className="stats-grid" aria-label="Analytics summary">
        <article className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Total sessions</p>
            <span className="stat-icon purple" aria-hidden="true">◉</span>
          </div>
          <h2 className="stat-value">{loading ? '—' : sessions.length}</h2>
          <p className="stat-caption">Recorded visitor sessions</p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Total events</p>
            <span className="stat-icon teal" aria-hidden="true">↗</span>
          </div>
          <h2 className="stat-value">{loading ? '—' : totalEvents}</h2>
          <p className="stat-caption">All recorded activity</p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Page views</p>
            <span className="stat-icon orange" aria-hidden="true">▤</span>
          </div>
          <h2 className="stat-value">{loading ? '—' : pageViews}</h2>
          <p className="stat-caption">Recorded page visits</p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Total clicks</p>
            <span className="stat-icon blue" aria-hidden="true">⌖</span>
          </div>
          <h2 className="stat-value">{loading ? '—' : totalClicks}</h2>
          <p className="stat-caption">{trackedPages} unique page paths tracked</p>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <h2>Click activity by page</h2>
              <p>Recorded clicks grouped by page URL.</p>
            </div>
            <span className="section-meta">Click events</span>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading page activity...</p>
            </div>
          ) : pageClickData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pageClickData}
                  margin={{ top: 8, right: 10, left: -18, bottom: 4 }}
                >
                  <CartesianGrid
                    stroke="#edf0f6"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="page"
                    tickFormatter={(value) => getPageLabel(value)}
                    tick={{ fill: '#8991a5', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#edf0f6' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#8991a5', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle}
                    formatter={(value) => [value, 'Clicks']}
                    labelFormatter={(label) => getPageLabel(String(label))}/>
                  <Bar
                    dataKey="clicks"
                    name="Clicks"
                    fill="#625cf0"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={52}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">↗</span>
              <p>
                No click events yet. Interact with a tracked page to populate
                this chart.
              </p>
            </div>
          )}
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <h2>Event distribution</h2>
              <p>Page views compared with clicks.</p>
            </div>
            <span className="section-meta">All events</span>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading event distribution...</p>
            </div>
          ) : eventDistribution.length > 0 ? (
            <>
              <div className="chart-container compact">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="48%"
                      innerRadius={62}
                      outerRadius={91}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {eventDistribution.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ color: '#7e879c', fontSize: 11 }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-legend">
                {eventDistribution.map((item, index) => (
                  <div className="legend-item" key={item.name}>
                    <span
                      className="legend-dot"
                      style={{
                        background:
                          CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    {item.name}: <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">◔</span>
              <p>
                Event distribution will appear after page views or clicks have
                been recorded.
              </p>
            </div>
          )}
        </article>
      </section>
      
<section className="panel heatmap-panel">
  <div className="section-heading">
    <div>
      <h2>Click heatmap</h2>
      <p>Explore where visitors clicked on each tracked page.</p>
    </div>

    <span className="section-meta">
      {heatmapClicks.length} clicks
    </span>
  </div>

  <label className="heatmap-label" htmlFor="heatmap-page">
    Select page
  </label>

  <select
    id="heatmap-page"
    className="heatmap-select"
    value={heatmapPage}
    onChange={(event) => setHeatmapPage(event.target.value)}
    disabled={!heatmapPages.length || heatmapLoading}
  >
    {heatmapPages.map((page) => (
      <option key={page} value={page}>
        {getPageLabel(page)}
      </option>
    ))}
  </select>

  {heatmapError ? (
    <div className="empty-state" role="alert">
      {heatmapError}
    </div>
  ) : heatmapLoading ? (
    <div className="empty-state">Loading click positions...</div>
  ) : heatmapClicks.length > 0 ? (
    <>
      <div className="heatmap-preview">
  <div className="heatmap-preview-header">
    <span>Page preview</span>
    <span>{getPageLabel(heatmapPage)}</span>
  </div>

  <div className="heatmap-preview-frame">
    <iframe
      key={heatmapPage}
      src={heatmapPreviewUrls[heatmapPage] ?? "http://localhost:5500/"}
      title={`Preview of ${getPageLabel(heatmapPage)}`}
      className="heatmap-iframe"
    />

    <div className="heatmap-coordinate-plane">
      <div className="heatmap-grid-lines" />

       
{heatmapClicks.map((click, index) => {
  const width = Math.max(1, click.viewportWidth ?? 1280)
  const height = Math.max(1, click.viewportHeight ?? 720)

  const left = Math.min(100, Math.max(0, (click.x / width) * 100))
  const top = Math.min(100, Math.max(0, (click.y / height) * 100))

  return (
    <span
      key={`${click.sessionId}-${click.timestamp}-${index}`}
      className="heatmap-hotspot"
      style={{
        left: `${left}%`,
        top: `${top}%`,
      }}
      title={`Click ${index + 1}: x=${click.x}, y=${click.y}`}
    />
  )
})}
      </div>
    </div>
  </div>

  <p className="info-note">
    Each dot represents a recorded click. Positions are scaled relative
    to the recorded coordinates, not an exact webpage screenshot.
  </p>
</>
) : (

    <div className="empty-state">
      No click coordinates found for this page. Visit the demo website
      and click somewhere to collect data.
    </div>
  )}
</section>


      <section className="panel sessions-panel">
        <div className="section-heading">
          <div>
            <h2>Visitor sessions</h2>
            <p>Select a visitor to explore their recorded activity.</p>
          </div>
          <span className="section-meta">
            {loading ? 'Loading' : `${sessions.length} sessions`}
          </span>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading visitor sessions...</p>
          </div>
        ) : sessions.length > 0 ? (
          <div className="sessions-list">
            {sessions.map((session) => (
              <button
                key={session.sessionId}
                type="button"
                className={`session-button ${
                  selectedSessionId === session.sessionId ? 'selected' : ''
                }`}
                onClick={() => setSelectedSessionId(session.sessionId)}
                aria-pressed={selectedSessionId === session.sessionId}
              >
                <span className="session-identity">
                  <span className="session-avatar" aria-hidden="true">
                    {session.sessionId.slice(0, 1).toUpperCase()}
                  </span>
                  <span>
                    <span className="session-name">
                      Visitor {sessions.length - sessions.indexOf(session)}
                  </span>
                    <span className="session-subtitle">
                      First seen {formatTime(session.firstEventAt)}
                    </span>
                  </span>
                </span>

                <span className="session-events">
                  {session.totalEvents} events
                </span>

                <span className="session-time">
                  {formatDuration(session.firstEventAt, session.lastEventAt)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden="true">◉</span>
            <p>
              No sessions have been recorded yet. Open a tracked page to start
              collecting analytics.
            </p>
          </div>
        )}
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <h2>User journey</h2>
              <p>
                {selectedSession
                  ? `Activity for ${selectedSession.sessionId}`
                  : 'Choose a session to inspect its timeline.'}
              </p>
            </div>

            {selectedSession && (
              <span className="section-meta">
                {formatDuration(
                  selectedSession.firstEventAt,
                  selectedSession.lastEventAt,
                )}
              </span>
            )}
          </div>

          {timelineLoading ? (
            <div className="empty-state">
              <p>Loading session events...</p>
            </div>
          ) : selectedEvents.length > 0 ? (
            <div className="journey-list">
              {selectedEvents.map((event, index) => (
                <article className="journey-event" key={event._id}>
                  <div
                    className={`timeline-marker ${
                      event.eventType === 'click' ? 'click-marker' : ''
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div className="event-content">
                    <h3>{eventLabel(event.eventType)}</h3>
                    <p>
                      <span className="event-page">{getPageLabel(event.pageUrl)}</span>
                      <span>{formatTime(event.timestamp)}</span>
                    </p>

                    {event.eventType === 'click' &&
                      typeof event.x === 'number' &&
                      typeof event.y === 'number' && (
                        <p>
                          Viewport coordinates: x = {event.x}, y = {event.y}
                        </p>
                      )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">↗</span>
              <p>
                Select a session with recorded events to see its journey here.
              </p>
            </div>
          )}
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <h2>Click coordinates</h2>
              <p>Recorded click positions for the selected session.</p>
            </div>
            <span className="section-meta">{recentClicks.length} clicks</span>
          </div>

          {recentClicks.length > 0 ? (
            <div className="coordinate-list">
              {recentClicks.map((event) => (
                <div className="coordinate-item" key={event._id}>
                  <span className="coordinate-page">{getPageLabel(event.pageUrl)}</span>
                  <span className="coordinate-values">
                    <span>X: {event.x}</span>
                    <span>Y: {event.y}</span>
                  </span>
                  <span className="coordinate-time">
                    Recorded at {formatTime(event.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">⌖</span>
              <p>
                No clicks with coordinates were recorded for this session yet.
              </p>
            </div>
          )}

          <p className="info-note">
            Coordinates are relative to the browser viewport. A visual
            heatmap overlay would additionally need the tracked page layout
            and a coordinate mapping.
          </p>
        </article>
      </section>

      <footer className="dashboard-footer">
        <span className="footer-brand">User Analytics</span>
        <span>Connected to the analytics API · Data from recorded events</span>
      </footer>
    </main>
  )
}

export default App
