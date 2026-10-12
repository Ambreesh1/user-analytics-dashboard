
import { useEffect, useMemo, useState } from 'react'
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



const COLORS = ['#6c63ff', '#12b8a6', '#f5a33b', '#438df5', '#ed78a1']

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatDuration(start: string, end: string) {
  const seconds = Math.max(
    0,
    Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000),
  )

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}m ${remainingSeconds}s`
}

function eventLabel(eventType: AnalyticsEvent['eventType']) {
  return eventType === 'page_view' ? 'Page Viewed' : 'Button Clicked'
}

function App() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [allEvents, setAllEvents] = useState<AnalyticsEvent[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<AnalyticsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_URL}/sessions`)

        if (!response.ok) {
          throw new Error('Could not load sessions from the backend.')
        }

        const data: ApiSessionsResponse = await response.json()
        setSessions(data.sessions)

        if (data.sessions.length > 0) {
          setSelectedSessionId(data.sessions[0].sessionId)
        }

        // Load event details for every session so charts use real data.
        const eventResponses = await Promise.all(
          data.sessions.map(async (session) => {
            const result = await fetch(
              `${API_URL}/sessions/${encodeURIComponent(session.sessionId)}/events`,
            )

            if (!result.ok) {
              throw new Error(`Could not load events for ${session.sessionId}.`)
            }

            const eventData: ApiEventsResponse = await result.json()
            return eventData.events
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
    }

    loadAnalytics()
  }, [])

  useEffect(() => {
    if (!selectedSessionId) {
      setSelectedEvents([])
      return
    }

    let cancelled = false

    async function loadTimeline() {
      try {
        setTimelineLoading(true)

        const response = await fetch(
          `${API_URL}/sessions/${encodeURIComponent(selectedSessionId!)}/events`,
        )

        if (!response.ok) {
          throw new Error('Could not load this session timeline.')
        }

        const data: ApiEventsResponse = await response.json()

        if (!cancelled) {
          setSelectedEvents(data.events)
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

    loadTimeline()

    return () => {
      cancelled = true
    }
  }, [selectedSessionId])

  const selectedSession =
    sessions.find((session) => session.sessionId === selectedSessionId) ?? null

  const totalEvents = sessions.reduce(
    (total, session) => total + session.totalEvents,
    0,
  )

  const trackedPages = new Set(allEvents.map((event) => event.pageUrl)).size

  const eventDistribution = useMemo(() => {
    const pageViews = allEvents.filter(
      (event) => event.eventType === 'page_view',
    ).length

    const clicks = allEvents.filter(
      (event) => event.eventType === 'click',
    ).length

    return [
      { name: 'Page Views', value: pageViews },
      { name: 'Clicks', value: clicks },
    ].filter((item) => item.value > 0)
  }, [allEvents])

  const pageClickData = useMemo(() => {
    const counts = new Map<string, number>()

    allEvents
      .filter((event) => event.eventType === 'click')
      .forEach((event) => {
        counts.set(event.pageUrl, (counts.get(event.pageUrl) ?? 0) + 1)
      })

    return Array.from(counts, ([page, clicks]) => ({
      page,
      clicks,
    })).sort((a, b) => b.clicks - a.clicks)
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
        <div>
          <p className="eyebrow">ANALYTICS OVERVIEW</p>
          <h1>User Analytics</h1>
          <p className="subtitle">
            Understand how visitors interact with your website.
          </p>
        </div>
        <span className="status">
          {loading ? 'Loading data' : 'Live API data'}
        </span>
      </header>

      {error && (
        <div className="demo-note" role="alert">
          {error} Check that your backend is running at localhost:4000.
        </div>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <p>Total Sessions</p>
          <h2>{loading ? '—' : sessions.length}</h2>
          <span>Sessions stored in the database</span>
        </article>

        <article className="stat-card">
          <p>Total Events</p>
          <h2>{loading ? '—' : totalEvents}</h2>
          <span>Recorded page views and clicks</span>
        </article>

        <article className="stat-card">
          <p>Pages Tracked</p>
          <h2>{loading ? '—' : trackedPages}</h2>
          <span>Unique page paths in recorded events</span>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Visitor Sessions</h2>
            <p>Select a session to explore its activity.</p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading visitor sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            No sessions found yet. Visit a tracked page to generate events.
          </div>
        ) : (
          <div className="sessions-list">
            {sessions.map((session) => (
              <button
                key={session.sessionId}
                type="button"
                className={`session-button ${
                  selectedSessionId === session.sessionId ? 'selected' : ''
                }`}
                onClick={() => setSelectedSessionId(session.sessionId)}
              >
                <span>{session.sessionId}</span>
                <span>{session.totalEvents} events</span>
                <span>
                  {formatTime(session.firstEventAt)}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>User Journey</h2>
            <p>
              {selectedSession
                ? `Activity timeline for ${selectedSession.sessionId}`
                : 'Select a session to inspect its event timeline.'}
            </p>
          </div>
          {selectedSession && (
            <span className="event-page">
              {formatDuration(
                selectedSession.firstEventAt,
                selectedSession.lastEventAt,
              )}
            </span>
          )}
        </div>

        {timelineLoading ? (
          <div className="empty-state">Loading session events...</div>
        ) : selectedEvents.length > 0 ? (
          <div className="journey-list">
            {selectedEvents.map((event, index) => (
              <article className="journey-event" key={event._id}>
                <div className="timeline-marker">{index + 1}</div>
                <div className="event-content">
                  <h3>{eventLabel(event.eventType)}</h3>
                  <p>
                    <span className="event-page">{event.pageUrl}</span>
                    <span>{formatTime(event.timestamp)}</span>
                  </p>
                  {event.eventType === 'click' &&
                    typeof event.x === 'number' &&
                    typeof event.y === 'number' && (
                      <p>
                        Click coordinates: x = {event.x}, y = {event.y}
                      </p>
                    )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            No events are available for this session.
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Events by Page</h2>
            <p>Real click counts grouped by page URL.</p>
          </div>
        </div>

        {pageClickData.length > 0 ? (
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart
                data={pageClickData}
                margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="page" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="clicks"
                  name="Clicks"
                  fill="#6c63ff"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-state">
            No click data yet. Clicks will appear here after they are recorded.
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Event Distribution</h2>
            <p>Compare recorded page views with clicks.</p>
          </div>
        </div>

        {eventDistribution.length > 0 ? (
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={eventDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {eventDistribution.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-state">
            No event data available to display.
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Click Coordinates</h2>
            <p>
              Recorded click positions for the selected visitor session.
            </p>
          </div>
        </div>

        {recentClicks.length > 0 ? (
          <div className="heatmap-list">
            {recentClicks.map((event) => (
              <div className="heatmap-row" key={event._id}>
                <div className="heatmap-label">
                  <span>{event.pageUrl}</span>
                  <strong>
                    x: {event.x}, y: {event.y}
                  </strong>
                </div>
                <div className="heatmap-track">
                  <div
                    className="heatmap-bar"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(5, ((event.x ?? 0) / 1000) * 100),
                      )}%`,
                    }}
                  />
                </div>
                <span>{formatTime(event.timestamp)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            No click coordinates recorded for this session yet.
          </div>
        )}
        <p className="demo-note">
          Coordinates are relative to the browser viewport, not a visual
          heatmap of the page. A true heatmap needs the page layout or a
          screenshot and many recorded clicks.
        </p>
      </section>

      <footer className="dashboard-footer">
        User Analytics Dashboard · Connected to MongoDB API
      </footer>
    </main>
  )
}

export default App