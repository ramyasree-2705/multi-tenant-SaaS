import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
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

  try {
    if (req.method === 'GET') {
      // List all notes for the current tenant
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false })

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch notes' })
      }

      return res.status(200).json(notes)
    }

    if (req.method === 'POST') {
      const { title, content = '' } = req.body

      if (!title) {
        return res.status(400).json({ error: 'Title is required' })
      }

      // Check note limit for FREE plan
      if (user.tenant_plan === 'FREE') {
        const { count, error: countError } = await supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenant_id)

        if (countError) {
          return res.status(500).json({ error: 'Failed to check note limit' })
        }

        if (count && count >= 3) {
          return res.status(403).json({ 
            error: 'Note limit reached. Upgrade to Pro for unlimited notes.',
            code: 'NOTE_LIMIT_REACHED'
          })
        }
      }

      // Create the note
      const { data: note, error } = await supabase
        .from('notes')
        .insert({
          title,
          content,
          tenant_id: user.tenant_id,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        return res.status(500).json({ error: 'Failed to create note' })
      }

      return res.status(201).json(note)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Notes API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}