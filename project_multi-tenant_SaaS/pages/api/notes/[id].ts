import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
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

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Note ID is required' })
  }

  try {
    if (req.method === 'GET') {
      // Retrieve a specific note
      const { data: note, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', user.tenant_id)
        .single()

      if (error || !note) {
        return res.status(404).json({ error: 'Note not found' })
      }

      return res.status(200).json(note)
    }

    if (req.method === 'PUT') {
      // Update a note
      const { title, content } = req.body

      if (!title) {
        return res.status(400).json({ error: 'Title is required' })
      }

      const { data: note, error } = await supabase
        .from('notes')
        .update({ 
          title, 
          content: content || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', user.tenant_id)
        .select()
        .single()

      if (error || !note) {
        return res.status(404).json({ error: 'Note not found or update failed' })
      }

      return res.status(200).json(note)
    }

    if (req.method === 'DELETE') {
      // Delete a note
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('tenant_id', user.tenant_id)

      if (error) {
        return res.status(500).json({ error: 'Failed to delete note' })
      }

      return res.status(204).end()
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Note API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}