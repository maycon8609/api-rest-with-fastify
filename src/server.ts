import { app } from './app'
import { env } from './env'

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('⏳ HTTP server running in port 3333! ⌛')
  })
