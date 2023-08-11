import mongodb, { MongoClient } from 'mongodb'

export let db: mongodb.Db
export let client: mongodb.MongoClient
export default async function getDB(): Promise<mongodb.Db> {
  if(!process.env.MONGODB_CONNECTION_STRING) throw new Error('Fill process.env.MONGODB_CONNECTION_STRING')
  if(global.db || db) return global.db ?? db
  client = new MongoClient(process.env.MONGODB_CONNECTION_STRING)
  const connection = await client.connect()
  db = connection.db('lufin')
  global.db = db
  return db
}
