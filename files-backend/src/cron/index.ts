import '../env.js'
import { deleteOldFiles } from './delete-old-files.js'
import { client as dbClient } from '../db.js'

await deleteOldFiles()

await dbClient.close()
process.exit(0)