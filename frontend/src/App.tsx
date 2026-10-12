
import { useState } from 'react'
import './App.css'

type Event = {
  id: number
  name: string
  page: string
  time: string
}

type Session = {
  session_id: string
  total_events: number
  duration: string
  device: string
  events: Event[]
}

const sessions: Session[] = [
  {
    session_id: 'sess_101',
    total_events: 5,
    duration: '4m 32s',
    device: 'Desktop',
    events: [
      { id: 1, name: 'Page Viewed', page: '/', time: '10:01:02' },
      { id: 2, name: 'Button Clicked', page: '/', time: '10:01:18' },
      { id: 3, name: 'Page Viewed', page: '/products', time: '10:02:10' },
      { id: 4, name: 'Form Started', page: '/contact', time: '10:04:05' },
      { id: 5, name: 'Form Submitted', page: '/contact', time: '10:05:34' },
    ],
  },
  {
    session_id: 'sess_102',
    total_events: 4,
    duration: '2m 15s',
    device: 'Mobile',
    events: [
      { id: 1, name: 'Page Viewed', page: '/', time: '11:15:02' },
      { id: 2, name: 'Page Viewed', page: '/pricing', time: '11:15:45' },
      { id: 3, name: 'Button Clicked', page: '/pricing', time: '11:16:20' },
      { id: 4, name: 'Checkout Started', page: '/checkout', time: '11:17:17' },
    ],
  },
  {
    session_id: 'sess_103',
    total_events: 3,
    duration: '1m 48s',
    device: 'Tablet',
    events: [
      { id: 1, name: 'Page Viewed', page: '/', time: '12:30:12' },
      { id: 2, name: 'Scroll Detected', page: '/', time: '12:30:40' },
      { id: 3, name: 'Page Viewed', page: '/about', time: '12:31:25' },
    ],
  },
]

const heatmapData = [
  { page: 'Home', clicks: 84 },
  { page: 'Products', clicks: 65 },
  { page: 'Pricing', clicks: 48 },
  { page: 'Contact', clicks: 35 },
  { page: 'About', clicks: 22 },
]

function App() {
  const [selectedSession, setSelectedSession] =
    useState<Session | null>(null)

  const totalEvents = sessions.reduce(
    (total, session) => total + session.total_events,
    0,
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
        <span className="status">Demo data</span>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <p>Total Sessions</p>
          <h2>{sessions.length}</h2>
          <span>Sample visitor sessions</span>
        </article>

        <article className="stat-card">
          <p>Total Events</p>
          <h2>{totalEvents}</h2>
          <span>Across all sample sessions</span>
        </article>

        <article className="stat-card">
          <p>Pages Tracked</p>
          <h2>{new Set(
            sessions.flatMap((session) =>
              session.events.map((event) => event.page),
            ),
          ).size}</h2>
          <span>Unique page paths in sample data</span>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Visitor Sessions</h2>
            <p>Select a session to explore its activity.</p>
          </div>
        </div>

        <div className="sessions-list">
          {sessions.map((session) => (
            <button
              key={session.session_id}
              type="button"
              className={`session-button ${
                selectedSession?.session_id === session.session_id
                  ? 'selected'
                  : ''
              }`}
              onClick={() => setSelectedSession(session)}
            >
              <span>{session.session_id}</span>
              <span>{session.total_events} events · {session.device}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>User Journey</h2>
            <p>
              {selectedSession
                ? `Activity timeline for ${selectedSession.session_id}`
                : 'Choose a session above to inspect its event timeline.'}
            </p>
          </div>
          {selectedSession && (
            <span className="event-page">{selectedSession.duration}</span>
          )}
        </div>

        {selectedSession ? (
          <div className="journey-list">
            {selectedSession.events.map((event) => (
              <article className="journey-event" key={event.id}>
                <div className="timeline-marker">{event.id}</div>
                <div className="event-content">
                  <h3>{event.name}</h3>
                  <p>
                    <span className="event-page">{event.page}</span>
                    <span>{event.time}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">↗</div>
            <p>Your visitor's journey will appear here after selecting a session.</p>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Page Interaction Overview</h2>
            <p>Illustrative click counts for the dashboard demo.</p>
          </div>
        </div>

        <div className="heatmap-list">
          {heatmapData.map((item) => (
            <div className="heatmap-row" key={item.page}>
              <div className="heatmap-label">
                <span>{item.page}</span>
                <strong>{item.clicks} clicks</strong>
              </div>
              <div className="heatmap-track">
                <div
                  className="heatmap-bar"
                  style={{ width: `${item.clicks}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="demo-note">
          Demo data only. These values are examples, not real visitor
          analytics. Actual click tracking requires event collection.
        </p>
      </section>

      <footer className="dashboard-footer">
        User Analytics Dashboard · Development Preview
      </footer>
    </main>
  )
}

export default App
