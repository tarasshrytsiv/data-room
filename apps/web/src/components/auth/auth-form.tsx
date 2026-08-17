'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

type Props = { mode: 'login' | 'register' }

export function AuthForm({ mode }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-extrabold text-[var(--color-foreground)]">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {mode === 'login' ? 'Welcome back' : 'Start your Data Room'}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full cursor-pointer"
        onClick={handleGoogle}
      >
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-[var(--color-muted-foreground)]">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
        {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
        <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
          {loading ? 'Loading…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--color-muted-foreground)]">
        {mode === 'login' ? (
          <>No account? <a href="/register" className="text-[var(--color-primary)] hover:underline">Register</a></>
        ) : (
          <>Have an account? <a href="/login" className="text-[var(--color-primary)] hover:underline">Sign in</a></>
        )}
      </p>
    </div>
  )
}
