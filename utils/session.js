// utils/session.js
// Shared session helper — used by dashboard and other protected pages

import { getIronSession } from 'iron-session';

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD,
  cookieName: 'fsvelasco_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
};

/**
 * Get the current session from a request/response pair
 * Use inside getServerSideProps:
 *   const session = await getSession(req, res);
 *   if (!session.bookkeeper) redirect to login
 */
export async function getSession(req, res) {
  return getIronSession(req, res, sessionOptions);
}
