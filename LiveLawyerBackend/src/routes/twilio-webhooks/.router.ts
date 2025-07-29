import express from 'express'
import registerRouteReceiveSms from './receive-sms'

// Router for: /twilio-webhooks

const router = express.Router()
registerRouteReceiveSms(router)
export default router
export const ROUTER_TWILIO_WEBHOOKS = '/twilio-webhooks'

// Types (not defined in LiveLawyerLibrary):

// Route: /receive-sms
export const ROUTE_TWILIO_WEBHOOKS_RECEIVE_SMS = '/receive-sms'
