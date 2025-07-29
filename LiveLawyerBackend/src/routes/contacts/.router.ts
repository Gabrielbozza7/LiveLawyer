import express from 'express'
import registerRouteList from './list'
import registerRouteModify from './modify'

// Router for: /contacts

const router = express.Router()
registerRouteList(router)
registerRouteModify(router)
export default router
