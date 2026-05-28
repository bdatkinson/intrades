import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Mail, Key } from 'lucide-react'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const toggleMode = () => setMode(mode === 'signin' ? 'signup' : 'signin')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return

    setSubmitting(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
        navigate('/designer')
      } else {
        await signUp(email, password)
        navigate('/designer')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-xl font-mono font-bold text-slate-100">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {mode === 'signin'
              ? 'Welcome back to InTrades'
              : 'Start your skilled trades journey'}
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              icon={<Key size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              isLoading={submitting}
            >
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>

            <p className="text-xs text-slate-500 font-mono">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
