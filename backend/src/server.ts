import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { setServers } from 'node:dns'

dotenv.config()
setServers(['8.8.8.8'])

const app = express()
const PORT = Number(process.env.PORT) || 4000
const MONGODB_URI = process.env.MONGODB_URI

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'User Analytics API is running',
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected',
  })
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
