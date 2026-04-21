import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

async function getCurrentUserId() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [diveCount, setDiveCount] = useState(0)
  const [creatureCount, setCreatureCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const userId = await getCurrentUserId()
      if (!userId) return

      const [profileResult, divesResult, creaturesResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).single(),
        supabase.from('dives').select('id', { count: 'exact', head: true }),
        supabase.from('dive_creatures').select('creature_id'),
      ])

      if (profileResult.error) throw profileResult.error

      setProfile(profileResult.data)
      setDiveCount(divesResult.count ?? 0)

      const uniqueCreatures = new Set((creaturesResult.data ?? []).map(r => r.creature_id))
      setCreatureCount(uniqueCreatures.size)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = async ({ name, description, certifications, photoFile }) => {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')

    let photo_url = profile?.photo_url ?? null

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${userId}/profile/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('dive-photos')
        .upload(path, photoFile, { upsert: true })
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('dive-photos')
          .getPublicUrl(path)
        photo_url = publicUrl
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ name, description, certifications, photo_url })
      .eq('user_id', userId)
    if (error) throw error

    await fetchProfile()
  }

  return { profile, diveCount, creatureCount, loading, error, updateProfile, refetch: fetchProfile }
}
