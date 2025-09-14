import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, User } from './auth'

export function authenticate(req: NextRequest): { user: User | null; response?: NextResponse } {
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  }

  return { user }
}

export function requireRole(user: User, requiredRole: 'ADMIN' | 'MEMBER'): NextResponse | null {
  if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 })
  }
  return null
}