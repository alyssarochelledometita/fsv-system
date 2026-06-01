import { query } from '../../../lib/db'
import { getSession } from '../../../lib/session'

export default async function handler(req, res) {
  const session = await getSession(req, res)
  const isAdmin = !!session?.bookkeeper

  // Public POST — anyone can submit an inquiry
  if (req.method === 'POST' && !isAdmin) {
    const { first_name, last_name, email, contact, message, space_ids = [] } = req.body
    if (!first_name || !last_name) return res.status(400).json({ error: 'Name required' })

    // Auto-assign to bookkeeper with least load
    const [bk] = await query(`
      SELECT b.id FROM bookkeepers b
      LEFT JOIN inquirers i ON i.bookkeeper_id = b.id
      GROUP BY b.id ORDER BY COUNT(i.id) LIMIT 1
    `)

    const [inq] = await query(
      `INSERT INTO inquirers (first_name, last_name, email, contact, message, bookkeeper_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [first_name, last_name, email, contact, message, bk?.id || null]
    )

    for (const sid of space_ids) {
      await query(
        'INSERT INTO inquirer_spaces (inquirer_id, space_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [inq.id, sid]
      )
    }

    return res.status(201).json(inq)
  }

  // Admin only below
  if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    const rows = await query(`
      SELECT
        i.*,
        b.name AS bookkeeper_name,
        COALESCE(
          json_agg(json_build_object('id', s.id, 'unit_number', s.unit_number, 'floor', s.floor, 'monthly_rate', s.monthly_rate))
          FILTER (WHERE s.id IS NOT NULL), '[]'
        ) AS spaces
      FROM inquirers i
      LEFT JOIN bookkeepers b ON i.bookkeeper_id = b.id
      LEFT JOIN inquirer_spaces ins ON ins.inquirer_id = i.id
      LEFT JOIN spaces s ON s.id = ins.space_id
      GROUP BY i.id, b.name
      ORDER BY i.created_at DESC
    `)
    return res.json(rows)
  }

  if (req.method === 'PUT') {
    const { id, status, bookkeeper_id } = req.body
    const [row] = await query(
      'UPDATE inquirers SET status=$1, bookkeeper_id=COALESCE($2,bookkeeper_id) WHERE id=$3 RETURNING *',
      [status, bookkeeper_id, id]
    )
    return res.json(row)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    await query('DELETE FROM inquirers WHERE id=$1', [id])
    return res.json({ ok: true })
  }

  res.status(405).end()
}