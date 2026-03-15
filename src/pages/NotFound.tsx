import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-6xl font-bold text-slate-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">Página não encontrada</h2>
        <p className="text-slate-500 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button asChild className="w-full">
          <Link to="/">Voltar para o Início</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
