// Change from '../utils/...' to '../../../utils/...'
import { query } from '../../../utils/db'; 
import { getSession } from '../../../utils/session';

export default async function handler(req, res) {
  // 1. Handle Logouts (DELETE request)
  if (req.method === 'DELETE') {
    const session = await getSession(req, res);
    session.destroy();
    return res.status(200).json({ success: true });
  }

  // 2. Handle Logins (POST request)
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      // Queries the bookkeepers table you created in your schema
      const sql = `
        SELECT id, first_name, last_name, email 
        FROM bookkeepers 
        WHERE email = $1 AND password = $2
      `;
      
      const rows = await query(sql, [email, password]);

      if (rows.length > 0) {
        const user = rows[0];
        const session = await getSession(req, res);
        
        // Save user into the encrypted iron-session cookie
        session.bookkeeper = {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email
        };
        
        await session.save();

        return res.status(200).json({ success: true });
      } else {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    } catch (error) {
      console.error('Database Authentication Error:', error);
      return res.status(500).json({ error: 'Internal server database error.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}