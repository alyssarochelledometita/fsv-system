import { getIronSession } from 'iron-session'

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'fs-velasco-secret-key-change-in-production-32chars',
  cookieName: 'fsvelasco_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export async function getSession(req, res) {
  return getIronSession(req, res, sessionOptions)
}

export function withAuth(handler) {
  return async (req, res) => {
    const session = await getSession(req, res)
    if (!session?.bookkeeper) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    req.session = session
    return handler(req, res)
  }
}