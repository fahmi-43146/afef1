"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'student' | 'professor'
  approval_status: 'pending' | 'approved' | 'rejected'
  student_id?: string
}

interface UserContextType {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAdmin: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    getInitialUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            setUser(session.user)
            
            await fetchUserProfile(session.user.id)
          } else {
            setUser(null)
            setProfile(null)
          }
        } catch (error) {
          console.error('❌ Error in auth state change:', error)
          // Don't break the auth flow even if profile creation fails
        } finally {
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const getInitialUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      }
    } catch (error) {
      console.error('Error getting initial user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId)
      
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // If profile doesn't exist, create it
      if (error && error.code === 'PGRST116') {
        console.log('📝 Profile not found, creating new profile...')
        
        // Get current user session to create profile
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
          console.error('❌ No current user found for profile creation')
          return
        }
        
        const newProfile = await createProfile(currentUser)
        
        if (newProfile) {
          console.log('✅ Profile created successfully:', newProfile)
          setProfile(newProfile)
          return
        } else {
          console.error('❌ Failed to create profile')
          return
        }
      }

      if (error) {
        console.error('❌ Error fetching user profile:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          userId: userId
        })
        return
      }
      
      console.log('✅ Profile loaded successfully:', data)
      
      // Check approval status
      if (data.approval_status === 'pending') {
        console.log('⏳ User account is pending approval')
      } else if (data.approval_status === 'rejected') {
        console.log('❌ User account has been rejected')
      }
      
      setProfile(data)
    } catch (error) {
      console.error('❌ Error fetching user profile:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId: userId
      })
    }
  }

    const createProfile = async (user: any) => {
    if (!user) return null

    try {
      console.log('🔧 Creating profile for:', user.email)
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            role: user.email === 'anatounsi43146@gmail.com' ? 'admin' : 'student',
            approval_status: user.email === 'anatounsi43146@gmail.com' ? 'approved' : 'pending'
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('❌ Profile creation failed:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          user_id: user.id,
          user_email: user.email
        })
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Profile creation exception:', error)
      return null
    }
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <UserContext.Provider value={{ user, profile, isLoading, isAdmin }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 