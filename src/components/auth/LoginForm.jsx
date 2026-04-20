import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginForm({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })

    if (loginError) {
      setError(loginError.message)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-white">Welcome back</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-500"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-500"
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-semibold rounded-lg py-3 transition-colors"
      >
        {loading ? 'Logging in…' : 'Log in'}
      </button>

      <p className="text-gray-400 text-sm text-center">
        No account?{' '}
        <button type="button" onClick={onSwitch} className="text-teal-400 hover:underline">
          Sign up
        </button>
      </p>
    </form>
  )
}
