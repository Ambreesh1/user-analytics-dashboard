
import { Schema, model, type InferSchemaType } from 'mongoose'

const eventSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    eventType: {
      type: String,
      enum: ['page_view', 'click'],
      required: true,
    },
    pageUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    x: {
      type: Number,
      min: 0,
    },
    y: {
      type: Number,
      min: 0,
    },
    viewportWidth: {
  type: Number,
  min: 1,
},
viewportHeight: {
  type: Number,
  min: 1,
},
  },
  { timestamps: true },
)

eventSchema.index({ sessionId: 1, timestamp: 1 })
eventSchema.index({ eventType: 1, pageUrl: 1 })

export type AnalyticsEvent = InferSchemaType<typeof eventSchema>

const EventModel = model('AnalyticsEvent', eventSchema)

export default EventModel
