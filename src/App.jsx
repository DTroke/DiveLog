import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { AuthProvider } from './lib/AuthContext'
import AuthPage from './pages/AuthPage'
import DiveLogPage from './pages/DiveLogPage'
import PokedexPage from './pages/PokedexPage'
import MapPage from './pages/MapPage'
import ProfilePage from './pages/ProfilePage'
import BottomNav from './components/ui/BottomNav'
import DiveDetail from './components/dives/DiveDetail'
import DiveForm from './components/dives/DiveForm'
import CreatureDetail from './components/creatures/CreatureDetail'
import CreatureForm from './components/creatures/CreatureForm'

function MainApp() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col pb-16">
      <Routes>
        <Route path="/log" element={<DiveLogPage />} />
        <Route path="/log/new" element={<DiveForm />} />
        <Route path="/log/:id/edit" element={<DiveForm />} />
        <Route path="/log/:id" element={<DiveDetail />} />
        <Route path="/pokedex" element={<PokedexPage />} />
        <Route path="/pokedex/new" element={<CreatureForm />} />
        <Route path="/pokedex/:id" element={<CreatureDetail />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/log" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session ?? null)
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
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

  if (!session) {
    return <AuthPage />
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </AuthProvider>
  )
}
