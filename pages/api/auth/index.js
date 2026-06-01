import { query } from '../../../lib/db'
import { getSession } from '../../../lib/session'

export default async function handler(req, res) {
  const session = await getSession(req, res)

  // GET /api/auth → check session
  if (req.method === 'GET') {
    if (session?.bookkeeper) {
      return res.json({ bookkeeper: session.bookkeeper })
    }
    return res.status(401).json({ error: 'Not authenticated' })
  }

  // POST /api/auth → login
  if (req.method === 'POST') {
    const { action, username, password } = req.body

    if (action === 'login') {
      const rows = await query(
        'SELECT id, name, username, email, contact FROM bookkeepers WHERE username=$1 AND password=$2',
        [username, password]
      )
      if (!rows.length) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }
      session.bookkeeper = rows[0]
      await session.save()
      return res.json({ bookkeeper: rows[0] })
    }

    if (action === 'logout') {
      session.destroy()
      return res.json({ ok: true })
    }
  }

  res.status(405).end()
}