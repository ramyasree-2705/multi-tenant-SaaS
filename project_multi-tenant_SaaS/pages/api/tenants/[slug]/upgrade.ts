import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../../lib/supabase'
import { verifyToken } from '../../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Authenticate user
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.substring(7)
  const user = verifyToken(token)
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Check if user is admin
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin role required' })
  }

  const { slug } = req.query
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Tenant slug is required' })
  }

  // Verify the slug matches the user's tenant
  if (slug !== user.tenant_slug) {
    return res.status(403).json({ error: 'Cannot upgrade different tenant' })
  }

  try {
    // Upgrade tenant to PRO plan
    const { data: tenant, error } = await supabase
      .from('tenants')
      .update({ 
        plan: 'PRO',
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .select()
      .single()

    if (error || !tenant) {
      return res.status(404).json({ error: 'Tenant not found or update failed' })
    }

    return res.status(200).json({
      message: 'Tenant upgraded to Pro plan successfully',
      tenant: {
        slug: tenant.slug,
        name: tenant.name,
        plan: tenant.plan
      }
    })
  } catch (error) {
    console.error('Upgrade error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}