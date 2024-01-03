import crypto from 'node:crypto'
import fastify from 'fastify'

import { knex } from './database'
import { env } from './env'

const app = fastify()

app.get('/transactions', async () => {
  const transaction = await knex('transactions').select('*')

  return transaction
})

app.post('/transactions', async () => {
  const transaction = await knex('transactions')
    .insert({
      id: crypto.randomUUID(),
      title: 'Title',
      amount: 1000,
    })
    .returning('*')

  return transaction
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP server running in port 3333!')
  })
