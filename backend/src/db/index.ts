import mongodb, { MongoClient } from 'mongodb'

export let db: mongodb.Db
export let client: mongodb.MongoClient
export default async function getDB(): Promise<mongodb.Db> {
  if (!process.env.MONGODB_CONNECTION_STRING)
    throw new Error('Fill process.env.MONGODB_CONNECTION_STRING')
  if (db) return db
  client = new MongoClient(process.env.MONGODB_CONNECTION_STRING)
  const connection = await client.connect()
  db = connection.db('lufin')
  return db
}

export async function close() {
  if (client) {
    await client.close()
  }
}

process.on('SIGINT', async () => {
  await close()
  process.exit(0)
})
