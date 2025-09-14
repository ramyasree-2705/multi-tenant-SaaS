import React, { useState, useEffect } from 'react'
import { LogIn, Plus, Trash2, Edit, Crown, User } from 'lucide-react'

interface User {
  id: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  tenant_slug: string
  tenant_plan: 'FREE' | 'PRO'
}

interface Note {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string>('')
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  // Note form state
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const API_BASE = process.env.NODE_ENV === 'production' 
    ? 'https://your-app.vercel.app' 
    : 'http://localhost:3000'

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      setToken(savedToken)
    }
  }, [])

  useEffect(() => {
    if (user && token) {
      fetchNotes()
    }
  }, [user, token])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setUser(data.user)
      setToken(data.token)
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)
      
      setLoginEmail('')
      setLoginPassword('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken('')
    setNotes([])
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const fetchNotes = async () => {
    if (!token) return

    try {
      const response = await fetch(`${API_BASE}/api/notes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err)
    }
  }

  const createOrUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteTitle.trim()) return

    setLoading(true)
    setError('')

    try {
      const url = editingNote 
        ? `${API_BASE}/api/notes/${editingNote.id}`
        : `${API_BASE}/api/notes`
      
      const method = editingNote ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === 'NOTE_LIMIT_REACHED') {
          setError(`${data.error} ${user?.role === 'ADMIN' ? 'You can upgrade to Pro below.' : 'Contact your admin to upgrade.'}`)
        } else {
          throw new Error(data.error || `${editingNote ? 'Update' : 'Create'} failed`)
        }
        return
      }

      // Reset form
      setNoteTitle('')
      setNoteContent('')
      setEditingNote(null)
      
      // Refresh notes
      await fetchNotes()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`${API_BASE}/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchNotes()
      }
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  const startEdit = (note: Note) => {
    setEditingNote(note)
    setNoteTitle(note.title)
    setNoteContent(note.content)
  }

  const cancelEdit = () => {
    setEditingNote(null)
    setNoteTitle('')
    setNoteContent('')
  }

  const upgradeTenant = async () => {
    if (!user || user.role !== 'ADMIN') return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/api/tenants/${user.tenant_slug}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upgrade failed')
      }

      // Update user state
      const updatedUser = { ...user, tenant_plan: 'PRO' as const }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      alert('Successfully upgraded to Pro plan!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isLimitReached = user?.tenant_plan === 'FREE' && notes.length >= 3

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <LogIn className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Multi-Tenant Notes</h1>
            <p className="text-gray-600">Sign in to access your notes</p>
          </div>

          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
                required
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Test Accounts (password: password)</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div>• admin@acme.test (Acme Admin)</div>
              <div>• user@acme.test (Acme Member)</div>
              <div>• admin@globex.test (Globex Admin)</div>
              <div>• user@globex.test (Globex Member)</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {user.role === 'ADMIN' ? (
                <Crown className="w-5 h-5 text-yellow-500" />
              ) : (
                <User className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {user.tenant_slug.charAt(0).toUpperCase() + user.tenant_slug.slice(1)} Notes
                </h1>
                <p className="text-sm text-gray-600">
                  {user.email} • {user.role} • {user.tenant_plan} Plan
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Plan Status & Upgrade */}
        {user.tenant_plan === 'FREE' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Free Plan - {notes.length}/3 notes used
                </h3>
                <p className="text-sm text-yellow-700">
                  {isLimitReached ? 'Note limit reached. ' : ''}
                  Upgrade to Pro for unlimited notes.
                </p>
              </div>
              {user.role === 'ADMIN' && (
                <button
                  onClick={upgradeTenant}
                  disabled={loading}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Upgrading...' : 'Upgrade to Pro'}
                </button>
              )}
            </div>
          </div>
        )}

        {user.tenant_plan === 'PRO' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <h3 className="text-sm font-medium text-green-800">
              Pro Plan - Unlimited notes ✨
            </h3>
          </div>
        )}

        {/* Note Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </h2>
          
          <form onSubmit={createOrUpdateNote} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter note title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter note content"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading || (!editingNote && isLimitReached)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {editingNote ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{loading ? 'Saving...' : editingNote ? 'Update Note' : 'Add Note'}</span>
              </button>
              {editingNote && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">No notes yet. Create your first note above!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(note)}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {note.content && (
                  <p className="text-gray-600 mb-2 whitespace-pre-wrap">{note.content}</p>
                )}
                <p className="text-xs text-gray-400">
                  Created: {new Date(note.created_at).toLocaleString()}
                  {note.updated_at !== note.created_at && (
                    <span> • Updated: {new Date(note.updated_at).toLocaleString()}</span>
                  )}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}