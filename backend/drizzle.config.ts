import { defineConfig } from 'drizzle-kit'

const DATABASE_URL = process.env.POSTGRESQL_CONNECTION_STRING
if (!DATABASE_URL) {
  throw new Error('Please set process.env.POSTGRESQL_CONNECTION_STRING')
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/postgresql.ts',
  dbCredentials: { url: DATABASE_URL },
  verbose: true,
  strict: true,
})
