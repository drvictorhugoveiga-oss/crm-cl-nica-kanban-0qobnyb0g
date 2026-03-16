import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { Activity } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

const signupSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório e deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signUp, user, loading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (user && !isAuthLoading) {
      navigate(from, { replace: true })
    }
  }, [user, isAuthLoading, navigate, from])

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  })

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: { name: '', email: '', password: '' },
  })

  const onLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true)
    try {
      const { error } = await signIn(values.email, values.password)
      if (error) throw error
      toast.success('Login realizado com sucesso!')
      navigate(from, { replace: true })
    } catch (e: any) {
      toast.error('Credenciais inválidas ou erro de rede.')
    } finally {
      setIsLoading(false)
    }
  }

  const onSignup = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true)
    try {
      const { error } = await signUp(values.email, values.password, values.name)
      if (error) throw error
      toast.success('Conta criada com sucesso!')
      navigate(from, { replace: true })
    } catch (e: any) {
      toast.error(e.message || 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-2 animate-pulse">
            <Activity className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="text-muted-foreground animate-pulse font-medium">
            Carregando ClinicFlow...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-all duration-500 ease-in-out">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-sm border border-border p-8 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-md shadow-primary/20">
            <Activity className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground transition-all duration-300">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm text-center transition-all duration-300">
            {isLogin
              ? 'Acesse o ClinicFlow para gerenciar seus pacientes.'
              : 'Comece a gerenciar seus leads de forma inteligente.'}
          </p>
        </div>

        {isLogin ? (
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onLogin)}
              className="space-y-4 animate-in fade-in duration-300"
            >
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        className="h-11 transition-all duration-300 focus-visible:ring-primary/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="animate-in fade-in slide-in-from-top-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-11 transition-all duration-300 focus-visible:ring-primary/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="animate-in fade-in slide-in-from-top-1" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-11 transition-all duration-300"
                disabled={isLoading || !loginForm.formState.isValid}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...signupForm}>
            <form
              onSubmit={signupForm.handleSubmit(onSignup)}
              className="space-y-4 animate-in fade-in duration-300"
            >
              <FormField
                control={signupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dr. João da Silva"
                        className="h-11 transition-all duration-300 focus-visible:ring-primary/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="animate-in fade-in slide-in-from-top-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        className="h-11 transition-all duration-300 focus-visible:ring-primary/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="animate-in fade-in slide-in-from-top-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-11 transition-all duration-300 focus-visible:ring-primary/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="animate-in fade-in slide-in-from-top-1" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-11 bg-primary transition-all duration-300"
                disabled={isLoading || !signupForm.formState.isValid}
              >
                {isLoading ? 'Criando...' : 'Criar conta'}
              </Button>
            </form>
          </Form>
        )}

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          </span>{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              loginForm.reset()
              signupForm.reset()
            }}
            className="text-primary font-medium hover:underline transition-all duration-200"
          >
            {isLogin ? 'Cadastre-se' : 'Faça login'}
          </button>
        </div>
      </div>
    </div>
  )
}
