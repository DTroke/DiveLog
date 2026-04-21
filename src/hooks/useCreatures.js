import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

async function getCurrentUserId() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

export function useCreatures() {
  const [creatures, setCreatures] = useState([])
  const [sightings, setSightings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const [creaturesResult, sightingsResult] = await Promise.all([
        // RLS policy returns pre-built + current user's custom creatures
        supabase.from('creatures').select('*').order('name'),
        // RLS policy returns only sightings linked to current user's dives
        supabase
          .from('dive_creatures')
          .select('id, creature_id, creature_photo_url, dive_id, dives(id, date, location_name)')
      ])

      if (creaturesResult.error) throw creaturesResult.error
      if (sightingsResult.error) throw sightingsResult.error

      setCreatures(creaturesResult.data ?? [])
      setSightings(sightingsResult.data ?? [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const unlockedIds = new Set(sightings.map(s => s.creature_id))

  function getFirstSighting(creatureId) {
    return sightings
      .filter(s => s.creature_id === creatureId && s.dives?.date)
      .sort((a, b) => new Date(a.dives.date) - new Date(b.dives.date))[0] ?? null
  }

  async function addSighting({ creatureId, diveId, photoFile }) {
    const userId = await getCurrentUserId()
    let creature_photo_url = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${userId}/creatures/${creatureId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('dive-photos').upload(path, photoFile)
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('dive-photos').getPublicUrl(path)
        creature_photo_url = publicUrl
      }
    }
    const { error } = await supabase
      .from('dive_creatures')
      .insert({ creature_id: creatureId, dive_id: diveId, creature_photo_url })
    if (error) throw error
    await fetchAll()
  }

  async function addCustomCreature({ name, description, photoFile, spottedDiveId }) {
    const userId = await getCurrentUserId()
    let image_url = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${userId}/custom-creatures/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('dive-photos').upload(path, photoFile)
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('dive-photos').getPublicUrl(path)
        image_url = publicUrl
      }
    }

    const { data: creature, error: insertError } = await supabase
      .from('creatures')
      .insert({ name, description: description || null, image_url, is_custom: true, user_id: userId })
      .select()
      .single()
    if (insertError) throw insertError

    if (spottedDiveId) {
      const { error: sightingError } = await supabase
        .from('dive_creatures')
        .insert({ creature_id: creature.id, dive_id: spottedDiveId })
      if (sightingError) throw sightingError
    }

    await fetchAll()
    return creature
  }

  return {
    creatures,
    sightings,
    unlockedIds,
    loading,
    error,
    refetch: fetchAll,
    getFirstSighting,
    addSighting,
    addCustomCreature,
  }
}
