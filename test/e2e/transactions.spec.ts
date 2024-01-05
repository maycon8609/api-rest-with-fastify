import { execSync } from 'node:child_process'
import supertest from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../../src/app'

describe('E2E - [routes] : transactions', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    const response = await supertest(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    })

    expect(response.statusCode).toEqual(201)
  })

  it('should be able to list all transaction', async () => {
    const transaction = {
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    }

    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send(transaction)

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    expect(listTransactionsResponse.statusCode).toEqual(200)
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: transaction.title,
        amount: transaction.amount,
      }),
    ])
  })

  it('should be able to get a specific transaction', async () => {
    const transaction = {
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    }

    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send(transaction)

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getOneTransactionResponse = await supertest(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)

    expect(listTransactionsResponse.statusCode).toEqual(200)
    expect(getOneTransactionResponse.body.transaction).toEqual(
      listTransactionsResponse.body.transactions[0],
    )
  })

  it('should be able to get the summary', async () => {
    const creditTransaction = {
      title: 'Credit transaction',
      amount: 5000,
      type: 'credit',
    }

    const debitTransaction = {
      title: 'Debit transaction',
      amount: 2000,
      type: 'debit',
    }

    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send(creditTransaction)

    const cookies = createTransactionResponse.get('Set-Cookie')

    await supertest(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send(debitTransaction)

    const summaryTransactionsResponse = await supertest(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)

    expect(summaryTransactionsResponse.statusCode).toEqual(200)
    expect(summaryTransactionsResponse.body.summary).toEqual({
      amount: creditTransaction.amount - debitTransaction.amount,
    })
  })
})
