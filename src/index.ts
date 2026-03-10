import { serve } from '@hono/node-server'
import { app } from './app.js'
import { env } from './config/env.js'

serve(
  {
    fetch: app.fetch,
    port: Number(env.PORT),
  },
  (info) => {
    console.log(`🚀 Codexia API running on http://localhost:${info.port}`)
    console.log(`📦 Environment: ${env.NODE_ENV}`)
  }
)
