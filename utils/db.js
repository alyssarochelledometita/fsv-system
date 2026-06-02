import { Pool } from 'pg';

// Debug check: Verify the host being used
if (process.env.DATABASE_URL) {
  console.log("Connecting to Database at:", process.env.DATABASE_URL.split('@')[1].split(':')[0]);
}

let pool;

if (!global._pgPool) {
  global._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Supabase connection
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

pool = global._pgPool;

export async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    console.error("Database Query Error:", error);
    throw error;
  }
}

export default pool;