import { Client } from 'pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { username, password } = req.body;
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    // Query your live Supabase table that you just built!
    const result = await client.query(
      'SELECT * FROM bookkeepers WHERE email = $1 AND password = $2', 
      [username, password]
    );
    
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, user: result.rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.end();
  }
}