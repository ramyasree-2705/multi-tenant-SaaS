import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

export interface User {
  id: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  tenant_id: string
  tenant_slug: string
  tenant_plan: 'FREE' | 'PRO'
}

export function generateToken(user: User): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        tenants (
          id,
          slug,
          name,
          plan
        )
      `)
      .eq('email', email)
      .single()

    if (userError || !userData) {
      return null
    }

    const isValidPassword = await comparePassword(password, userData.password_hash)
    if (!isValidPassword) {
      return null
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      tenant_id: userData.tenant_id,
      tenant_slug: userData.tenants.slug,
      tenant_plan: userData.tenants.plan
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}