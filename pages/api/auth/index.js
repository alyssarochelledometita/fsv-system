// pages/api/auth/index.js
// Handles: POST (login) and DELETE (logout)

import { getIronSession } from 'iron-session';
import { query } from '../../../utils/db';

// Must match SECRET_COOKIE_PASSWORD in your .env.local
const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD,
  cookieName: 'fsvelasco_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
};

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionOptions);

  // ─── LOGIN ───────────────────────────────────────────────
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Change this specific block in your file:
try {
  // We specify the columns explicitly to ensure they match exactly
  // Change your query to this:
const queryText = `
  SELECT id, first_name, last_name, email 
  FROM bookkeepers 
  WHERE email = $1 AND password = $2
`;
  const rows = await query(queryText, [username, password]);

  if (!rows || rows.length === 0) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  // ... rest of the code

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const bookkeeper = rows[0];

      // Save to session cookie
      // Update your session save logic:
        session.bookkeeper = {
        id: bookkeeper.id,
        name: `${bookkeeper.first_name} ${bookkeeper.last_name}`,
        email: bookkeeper.email,
      };
      await session.save();

      return res.status(200).json({ ok: true, user: session.bookkeeper });

    } catch (err) {
      console.error('Login DB error:', err.message);
      return res.status(500).json({ error: 'Database error. Check your DATABASE_URL.' });
    }
  }

  // ─── LOGOUT ──────────────────────────────────────────────
  if (req.method === 'DELETE') {
    await session.destroy();
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
