import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useCreatures } from '../../hooks/useCreatures'
import { calculateDiveNumbers } from '../../lib/diveUtils'

export default function CreatureForm() {
  const navigate = useNavigate()
  const { addCustomCreature } = useCreatures()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [alreadySpotted, setAlreadySpotted] = useState(false)
  const [spottedDiveId, setSpottedDiveId] = useState('')
  const [dives, setDives] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('dives')
      .select('id, date, location_name')
      .order('date', { ascending: false })
      .then(({ data }) => { if (data) setDives(data) })
  }, [])

  const diveNumbers = calculateDiveNumbers(dives)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await addCustomCreature({
        name: name.trim(),
        description: description.trim(),
        photoFile,
        spottedDiveId: alreadySpotted ? spottedDiveId || null : null,
      })
      navigate('/pokedex')
    } catch (err) {
      setError(err?.message ?? 'Something went wrong.')
      setSaving(false)
    }
  }

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/pokedex')}
          className="text-gray-400 hover:text-white"
        >
          ← Back
        </button>
        <h1 className="text-white text-xl font-bold">Add Custom Creature</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-400 text-sm mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="e.g. Nudibranch"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1.5">
            Description <span className="text-gray-600">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="What does it look like? Where is it found?"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 resize-none"
          />
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
                className="w-16 h-16 rounded-xl object-cover"
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
            <label className="flex items-center justify-center h-14 bg-gray-900 border border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-teal-700 transition-colors">
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

        {/* Spotted status */}
        <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
          <p className="text-gray-400 text-sm font-medium">Sighting status</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAlreadySpotted(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border ${!alreadySpotted ? 'bg-teal-950 border-teal-700 text-teal-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
            >
              Not yet spotted
            </button>
            <button
              type="button"
              onClick={() => setAlreadySpotted(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border ${alreadySpotted ? 'bg-teal-950 border-teal-700 text-teal-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
            >
              Already spotted
            </button>
          </div>

          {alreadySpotted && (
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">
                Link to a dive <span className="text-gray-600">(optional)</span>
              </label>
              {dives.length === 0 ? (
                <p className="text-gray-500 text-sm">No dives logged yet — creature will appear as spotted without a dive reference.</p>
              ) : (
                <select
                  value={spottedDiveId}
                  onChange={e => setSpottedDiveId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">No specific dive</option>
                  {dives.map(d => (
                    <option key={d.id} value={d.id}>
                      Dive #{diveNumbers[d.id]} — {d.location_name} ({d.date})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Add Creature'}
        </button>
      </form>
    </div>
  )
}
