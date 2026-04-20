import { supabase } from '../lib/supabase'

export default function ProfilePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6">
      <h1 className="text-white text-2xl font-semibold">Profile</h1>
      <button
        onClick={() => supabase.auth.signOut()}
        className="text-gray-400 text-sm hover:text-white underline"
      >
        Log out
      </button>
    </div>
  )
}
