import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import AuthPage from './pages/AuthPage'

function MainApp() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white text-xl">You're in! Main app coming soon.</p>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (event === 'SIGNED_IN' && session?.user) {
        const { id, user_metadata } = session.user
        await supabase.from('profiles').upsert(
          { user_id: id, name: user_metadata?.name ?? '', certifications: [] },
          { onConflict: 'user_id', ignoreDuplicates: true }
        )
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return session ? <MainApp /> : <AuthPage />
}
