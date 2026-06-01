import { query } from '../../../lib/db'
import { getSession } from '../../../lib/session'

export default async function handler(req, res) {
  const session = await getSession(req, res)
  const isAdmin = !!session?.bookkeeper

  // GET is public (for the leasing directory)
  if (req.method === 'GET') {
    const { available_only } = req.query
    const rows = await query(`
      SELECT
        s.*,
        COALESCE(
          json_agg(
            json_build_object(
              'tenant_id', t.id,
              'tenant_name', t.first_name || ' ' || t.last_name,
              'business_name', t.business_name,
              'contract_id', c.id,
              'contract_end', c.end_date,
              'contract_status', c.status
            )
          ) FILTER (WHERE t.id IS NOT NULL AND c.status = 'Active'), '[]'
        ) AS tenants
      FROM spaces s
      LEFT JOIN contracts c ON c.space_id = s.id AND c.status = 'Active'
      LEFT JOIN tenants t ON c.tenant_id = t.id
      ${available_only === 'true' ? "WHERE s.status = 'Available'" : ''}
      GROUP BY s.id
      ORDER BY s.floor, s.unit_number
    `)
    return res.json(rows)
  }

  if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'POST') {
    const { unit_number, floor, monthly_rate, status = 'Available' } = req.body
    if (!unit_number || !floor) return res.status(400).json({ error: 'Unit number and floor required' })
    const [row] = await query(
      'INSERT INTO spaces (unit_number, floor, monthly_rate, status) VALUES ($1,$2,$3,$4) RETURNING *',
      [unit_number, floor, monthly_rate || 0, status]
    )
    return res.status(201).json(row)
  }

  if (req.method === 'PUT') {
    const { id, unit_number, floor, monthly_rate, status } = req.body
    const [row] = await query(
      'UPDATE spaces SET unit_number=COALESCE($1,unit_number), floor=COALESCE($2,floor), monthly_rate=COALESCE($3,monthly_rate), status=COALESCE($4,status) WHERE id=$5 RETURNING *',
      [unit_number, floor, monthly_rate, status, id]
    )
    return res.json(row)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    await query('DELETE FROM spaces WHERE id=$1', [id])
    return res.json({ ok: true })
  }

  res.status(405).end()
}