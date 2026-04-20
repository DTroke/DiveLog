import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

async function getCurrentUserId() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

export function useDives() {
  const [dives, setDives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDives = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('dives')
      .select('*, dive_photos(*), dive_creatures(*, creatures(*))')
      .order('date', { ascending: false })

    if (error) setError(error)
    else setDives(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDives()
  }, [fetchDives])

  const addDive = async ({ diveData, selectedCreatures, photos }) => {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated. Please log out and log back in.')

    const { data: dive, error: diveError } = await supabase
      .from('dives')
      .insert({ ...diveData, user_id: userId })
      .select()
      .single()
    if (diveError) throw diveError

    await Promise.all([
      uploadPhotos(dive.id, userId, photos),
      insertDiveCreatures(dive.id, selectedCreatures),
    ])

    await fetchDives()
    return dive
  }

  const updateDive = async ({ diveId, diveData, selectedCreatures, newPhotos, removedPhotoIds }) => {
    const userId = await getCurrentUserId()

    const { error: updateError } = await supabase
      .from('dives').update(diveData).eq('id', diveId)
    if (updateError) throw updateError

    await supabase.from('dive_creatures').delete().eq('dive_id', diveId)
    await insertDiveCreatures(diveId, selectedCreatures)

    if (removedPhotoIds?.length) {
      await supabase.from('dive_photos').delete().in('id', removedPhotoIds)
    }

    if (newPhotos?.length) await uploadPhotos(diveId, userId, newPhotos)

    await fetchDives()
  }

  const deleteDive = async (diveId) => {
    const { error } = await supabase.from('dives').delete().eq('id', diveId)
    if (error) throw error
    await fetchDives()
  }

  return { dives, loading, error, addDive, updateDive, deleteDive, refetch: fetchDives }
}

async function uploadPhotos(diveId, userId, photos) {
  if (!photos?.length) return
  for (const photo of photos) {
    const ext = photo.name.split('.').pop()
    const path = `${userId}/${diveId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('dive-photos').upload(path, photo)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('dive-photos').getPublicUrl(path)
      await supabase.from('dive_photos').insert({ dive_id: diveId, photo_url: publicUrl })
    }
  }
}

async function insertDiveCreatures(diveId, creatures) {
  if (!creatures?.length) return
  await supabase.from('dive_creatures').insert(
    creatures.map(c => ({ dive_id: diveId, creature_id: c.id }))
  )
}
