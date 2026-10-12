
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { setServers } from 'node:dns'
import EventModel from './models/Event'

dotenv.config()

// Local DNS workaround that fixed the MongoDB connection on this PC.
setServers(['8.8.8.8'])

const app = express()
const PORT = Number(process.env.PORT) || 4000
const MONGODB_URI = process.env.MONGODB_URI

app.use(cors())
app.use(express.json({ limit: '100kb' }))

// 1. Check whether the API and database are running.
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'User Analytics API is running',
    database:
      mongoose.connection.readyState === 1
        ? 'connected'
        : 'disconnected',
  })
})

// 2. Store a page_view or click event.
app.post('/api/events', async (req, res) => {
  try {
    const { sessionId, eventType, pageUrl, timestamp, x, y } =
      req.body ?? {}

    if (
      typeof sessionId !== 'string' ||
      !sessionId.trim() ||
      sessionId.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid sessionId is required',
      })
    }

    if (!['page_view', 'click'].includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: 'eventType must be page_view or click',
      })
    }

    if (
      typeof pageUrl !== 'string' ||
      !pageUrl.trim() ||
      pageUrl.length > 2048
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid pageUrl is required',
      })
    }

    if (
      timestamp !== undefined &&
      (typeof timestamp !== 'string' ||
        Number.isNaN(Date.parse(timestamp)))
    ) {
      return res.status(400).json({
        success: false,
        message: 'timestamp must be a valid date string',
      })
    }

    if (
      eventType === 'click' &&
      (
        typeof x !== 'number' ||
        !Number.isFinite(x) ||
        x < 0 ||
        typeof y !== 'number' ||
        !Number.isFinite(y) ||
        y < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Click events require non-negative numeric x and y coordinates',
      })
    }

    if (
      eventType === 'page_view' &&
      (
        (x !== undefined &&
          (typeof x !== 'number' || !Number.isFinite(x) || x < 0)) ||
        (y !== undefined &&
          (typeof y !== 'number' || !Number.isFinite(y) || y < 0))
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates must be non-negative numbers',
      })
    }

    const event = await EventModel.create({
      sessionId: sessionId.trim(),
      eventType,
      pageUrl: pageUrl.trim(),
      ...(timestamp ? { timestamp: new Date(timestamp) } : {}),
      ...(x !== undefined ? { x } : {}),
      ...(y !== undefined ? { y } : {}),
    })

    return res.status(201).json({
      success: true,
      message: 'Event stored successfully',
      event,
    })
  } catch (error) {
    console.error('Failed to store event:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to store event',
    })
  }
})

// 3. List sessions with event counts and latest activity.
app.get('/api/sessions', async (_req, res) => {
  try {
    const sessions = await EventModel.aggregate([
      {
        $group: {
          _id: '$sessionId',
          totalEvents: { $sum: 1 },
          firstEventAt: { $min: '$timestamp' },
          lastEventAt: { $max: '$timestamp' },
        },
      },
      { $sort: { lastEventAt: -1 } },
      {
        $project: {
          _id: 0,
          sessionId: '$_id',
          totalEvents: 1,
          firstEventAt: 1,
          lastEventAt: 1,
        },
      },
    ])

    return res.json({
      success: true,
      count: sessions.length,
      sessions,
    })
  } catch (error) {
    console.error('Failed to fetch sessions:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
    })
  }
})

// 4. Fetch one session's event timeline, oldest first.
app.get('/api/sessions/:id/events', async (req, res) => {
  try {
    const sessionId = req.params.id

    const events = await EventModel.find({ sessionId })
      .sort({ timestamp: 1, _id: 1 })
      .lean()

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No events found for this session',
      })
    }

    return res.json({
      success: true,
      sessionId,
      count: events.length,
      events,
    })
  } catch (error) {
    console.error('Failed to fetch session events:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch session events',
    })
  }
})

// 5. Fetch click coordinates for a specific page.
app.get('/api/events/clicks', async (req, res) => {
  try {
    const pageUrl = req.query.pageUrl

    if (typeof pageUrl !== 'string' || !pageUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Provide a pageUrl query parameter',
      })
    }

    const clicks = await EventModel.find({
      eventType: 'click',
      pageUrl: pageUrl.trim(),
      x: { $exists: true },
      y: { $exists: true },
    })
      .select('sessionId pageUrl timestamp x y')
      .sort({ timestamp: 1 })
      .lean()

    return res.json({
      success: true,
      pageUrl: pageUrl.trim(),
      count: clicks.length,
      clicks,
    })
  } catch (error) {
    console.error('Failed to fetch click coordinates:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch click coordinates',
    })
  }
})

async function startServer() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from the .env file')
  }

  await mongoose.connect(MONGODB_URI)
  console.log('MongoDB connected successfully')

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

startServer().catch((error: unknown) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
