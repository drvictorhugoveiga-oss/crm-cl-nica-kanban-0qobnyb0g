import { ReactNode, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!user?.id) return

    const controller = new AbortController()

    const fetchLeads = async () => {
      try {
        const { error } = await supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id)
          .abortSignal(controller.signal)

        if (error) {
          if (
            error.name === 'AbortError' ||
            error.message?.includes('Aborted') ||
            error.message?.includes('HTTP N/A') ||
            error.message?.includes('Failed to fetch')
          ) {
            // Suppress expected aborted request errors
            return
          }
          console.error('Supabase fetch error:', error)
        }
      } catch (err: any) {
        if (
          err.name === 'AbortError' ||
          err.message?.includes('Aborted') ||
          err.message?.includes('HTTP N/A') ||
          err.message?.includes('Failed to fetch')
        ) {
          // Suppress expected aborted request errors
          return
        }
        console.error('Unhandled fetch error:', err)
      }
    }

    fetchLeads()

    return () => {
      controller.abort()
    }
  }, [user?.id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]" />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
