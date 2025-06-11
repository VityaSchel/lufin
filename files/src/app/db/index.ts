let connection: import('mongodb').MongoClient | undefined = undefined
async function getConnection() {
  if(connection) return connection
  if(!process.env.MONGODB_CONNECTION_STRING) throw new Error('Fill process.env.MONGODB_CONNECTION_STRING')
  const { MongoClient } = await import('mongodb')
  const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING)
  connection = await client.connect()
  return connection
}

let db: import('mongodb').Db | undefined = undefined
export async function getDB(): Promise<import('mongodb').Db> {
  if (!db) db = (await getConnection()).db('lufin')
  return db
}