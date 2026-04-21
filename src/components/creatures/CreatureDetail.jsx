import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useCreatures } from '../../hooks/useCreatures'
import { calculateDiveNumbers } from '../../lib/diveUtils'

export default function CreatureDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { creatures, unlockedIds, getFirstSighting, addSighting, loading, refetch } = useCreatures()

  const [dives, setDives] = useState([])
  const [showSightingForm, setShowSightingForm] = useState(false)
  const [selectedDiveId, setSelectedDiveId] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    supabase
      .from('dives')
      .select('id, date, location_name')
      .order('date', { ascending: false })
      .then(({ data }) => { if (data) setDives(data) })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const creature = creatures.find(c => c.id === id)
  if (!creature) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-400 mt-8">Creature not found.</p>
        <button onClick={() => navigate('/pokedex')} className="mt-4 text-teal-400 hover:text-teal-300">
          ← Back to Pokédex
        </button>
      </div>
    )
  }

  const isUnlocked = unlockedIds.has(id)
  const firstSighting = getFirstSighting(id)
  const diveNumbers = calculateDiveNumbers(dives)

  const handleLogSighting = async (e) => {
    e.preventDefault()
    if (!selectedDiveId) return
    setSaving(true)
    setSaveError(null)
    try {
      await addSighting({ creatureId: id, diveId: selectedDiveId, photoFile })
      setShowSightingForm(false)
      setSelectedDiveId('')
      setPhotoFile(null)
    } catch (err) {
      setSaveError(err?.message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <button
        onClick={() => navigate('/pokedex')}
        className="text-gray-400 hover:text-white mb-4 block"
      >
        ← Back
      </button>

      {/* Creature image */}
      <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-900 mb-4">
        {creature.image_url ? (
          <img
            src={creature.image_url}
            alt={creature.name}
            className="w-full h-full object-cover"
            style={!isUnlocked ? { filter: 'grayscale(100%) brightness(0.3)' } : undefined}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-8xl bg-gray-800"
            style={!isUnlocked ? { filter: 'grayscale(100%) brightness(0.3)' } : undefined}
          >
            🐠
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isUnlocked ? 'bg-teal-950 text-teal-400 border border-teal-800' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
          {isUnlocked ? 'Spotted' : 'Not yet spotted'}
        </span>
        {creature.is_custom && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-violet-950 text-violet-400 border border-violet-800">
            Custom
          </span>
        )}
      </div>

      <h1 className="text-white text-2xl font-bold mb-2">{creature.name}</h1>

      {creature.description && (
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{creature.description}</p>
      )}

      {/* Unlocked: first sighting info */}
      {isUnlocked && firstSighting && (
        <div className="bg-gray-900 rounded-xl p-4 mb-4">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">First spotted</p>
          <Link
            to={`/log/${firstSighting.dive_id}`}
            className="text-teal-400 hover:text-teal-300 text-sm font-medium"
          >
            Dive #{diveNumbers[firstSighting.dive_id] ?? '?'} — {firstSighting.dives?.location_name ?? 'Unknown location'}
          </Link>
          <p className="text-gray-600 text-xs mt-0.5">{firstSighting.dives?.date}</p>

          {firstSighting.creature_photo_url && (
            <img
              src={firstSighting.creature_photo_url}
              alt={`${creature.name} sighting`}
              className="w-full rounded-xl mt-3 object-cover max-h-48"
            />
          )}
        </div>
      )}

      {/* Locked: log a sighting CTA */}
      {!isUnlocked && (
        <div className="mt-4">
          {!showSightingForm ? (
            <button
              onClick={() => setShowSightingForm(true)}
              className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl transition-colors"
            >
              Log a sighting
            </button>
          ) : (
            <form onSubmit={handleLogSighting} className="bg-gray-900 rounded-2xl p-4 space-y-4">
              <h2 className="text-white font-semibold">Log a sighting</h2>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Select dive</label>
                {dives.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No dives logged yet.{' '}
                    <Link to="/log/new" className="text-teal-400 hover:text-teal-300">Log your first dive</Link>
                    {' '}then come back.
                  </p>
                ) : (
                  <select
                    value={selectedDiveId}
                    onChange={e => setSelectedDiveId(e.target.value)}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="">Choose a dive...</option>
                    {dives.map(d => (
                      <option key={d.id} value={d.id}>
                        Dive #{diveNumbers[d.id]} — {d.location_name} ({d.date})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">
                  Photo <span className="text-gray-600">(optional)</span>
                </label>
                {photoFile ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={URL.createObjectURL(photoFile)}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoFile(null)}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center h-12 bg-gray-800 border border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-teal-700 transition-colors">
                    <span className="text-gray-500 text-sm">+ Add photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setPhotoFile(e.target.files[0] ?? null)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {saveError && (
                <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3">
                  {saveError}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowSightingForm(false); setSaveError(null) }}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !selectedDiveId}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
