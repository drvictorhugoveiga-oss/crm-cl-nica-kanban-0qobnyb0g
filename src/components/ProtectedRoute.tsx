import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Activity } from 'lucide-react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="h-16 w-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6">
          <Activity className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <div className="space-y-2 flex flex-col items-center">
          <div className="h-2 w-24 bg-slate-200 rounded-full animate-pulse" />
          <p className="text-slate-500 text-sm font-medium animate-pulse">Verificando sessão...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
