import { Pool } from 'pg'

let pool

export function getDB() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  }
  return pool
}

export async function query(sql, params = []) {
  const db = getDB()
  const { rows } = await db.query(sql, params)
  return rows
}