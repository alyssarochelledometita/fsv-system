import { query } from '../../utils/db'; // Make sure this path points to your db file
import { getSession } from '../../utils/session'; // Make sure this path points to your iron-session file

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  try {
    // 1. Look up the credentials in your Supabase 'bookkeepers' table
    const sql = `
      SELECT id, first_name, last_name, email 
      FROM bookkeepers 
      WHERE email = $1 AND password = $2
    `;
    
    const rows = await query(sql, [username, password]);

    if (rows.length > 0) {
      const user = rows[0];

      // 2. Initialize the iron-session
      const session = await getSession(req, res);
      
      // 3. Save the user data into the encrypted cookie!
      // (This satisfies the `session?.bookkeeper` check in your withAuth middleware)
      session.bookkeeper = {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email
      };
      
      await session.save(); // Encrypts and writes the cookie to the browser

      // 4. Return success back to your frontend
      return res.status(200).json({ success: true, user: session.bookkeeper });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Session/Database Login Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}