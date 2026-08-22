import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase, signInWithGoogle, signOut } from '../lib/supabase'
import type { User } from '../types'

interface AuthContextType {
  supabaseUser: SupabaseUser | null
  session: Session | null
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
  isArtist: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const authTimeout = window.setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, 4000)

    // Clean up OAuth callback params from URL to prevent issues with React Router
    function cleanupAuthParams() {
      const url = new URL(window.location.href)
      if (url.searchParams.has('code') || url.searchParams.has('error')) {
        url.searchParams.delete('code')
        url.searchParams.delete('error')
        url.searchParams.delete('error_description')
        window.history.replaceState({}, '', url.pathname + url.hash)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      cleanupAuthParams()
      setSession(session)
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.email!)
      } else {
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return
        
        // Clean up URL on successful sign in
        if (event === 'SIGNED_IN') {
          cleanupAuthParams()
        }
        
        setSession(session)
        setSupabaseUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.email!)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => {
      cancelled = true
      window.clearTimeout(authTimeout)
      subscription.unsubscribe()
    }
  }, [])

  async function fetchUserProfile(email: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
      }
      setUser(data)
    } catch (err) {
      console.error('Error fetching user profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    supabaseUser,
    session,
    user,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isAdmin: user?.role === 'admin',
    isArtist: user?.role === 'artist' || user?.role === 'admin',
    isAuthenticated: !!supabaseUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
