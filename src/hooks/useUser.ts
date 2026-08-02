'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getDescopeCookieUser = () => {
      if (typeof document === 'undefined') return null;
      const match = document.cookie.match(/(^|;)\s*descope_session=([^;]+)/);
      if (match && match[2]) {
        const id = decodeURIComponent(match[2]);
        return { id, email: id } as User;
      }
      return null;
    };

    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user || getDescopeCookieUser())
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(getDescopeCookieUser())
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? getDescopeCookieUser())
        setLoading(false)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    userId: user?.id ?? null,
    loading,
    supabase,
  }
}
