import { useState } from 'react'
import LoginForm from '../components/auth/LoginForm'
import SignupForm from '../components/auth/SignupForm'

export default function AuthPage() {
  const [mode, setMode] = useState('login')

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">DiveLog</h1>
        <p className="text-gray-400 mt-1">Your personal dive journal</p>
      </div>

      <div className="w-full max-w-sm bg-gray-900 rounded-2xl p-6 shadow-xl">
        {mode === 'login' ? (
          <LoginForm onSwitch={() => setMode('signup')} />
        ) : (
          <SignupForm onSwitch={() => setMode('login')} />
        )}
      </div>
    </div>
  )
}
