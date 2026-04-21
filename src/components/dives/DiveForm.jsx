import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useDives } from '../../hooks/useDives'
import LocationPicker from '../map/LocationPicker'

export default function DiveForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dives, addDive, updateDive } = useDives()
  const isEdit = Boolean(id)

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [locationName, setLocationName] = useState('')
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [comments, setComments] = useState('')
  const [selectedCreatures, setSelectedCreatures] = useState([])
  const [newPhotos, setNewPhotos] = useState([])
  const [existingPhotos, setExistingPhotos] = useState([])
  const [removedPhotoIds, setRemovedPhotoIds] = useState([])

  const [allCreatures, setAllCreatures] = useState([])
  const [creatureSearch, setCreatureSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    supabase.from('creatures').select('id, name, image_url').order('name')
      .then(({ data, error }) => {
        if (error) console.error('Creatures fetch error:', error)
        else setAllCreatures(data ?? [])
      })
  }, [])

  useEffect(() => {
    if (isEdit && dives.length > 0) {
      const dive = dives.find(d => d.id === id)
      if (dive) {
        setDate(dive.date)
        setLocationName(dive.location_name)
        setLat(dive.latitude)
        setLng(dive.longitude)
        setComments(dive.comments ?? '')
        setExistingPhotos(dive.dive_photos ?? [])
        const creatureIds = dive.dive_creatures?.map(dc => dc.creature_id).filter(Boolean) ?? []
        if (creatureIds.length) {
          supabase.from('creatures').select('id, name, image_url').in('id', creatureIds).then(({ data }) => {
            if (data) setSelectedCreatures(data)
          })
        }
      }
    }
  }, [isEdit, id, dives])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleCreature = (creature) => {
    setSelectedCreatures(prev =>
      prev.find(c => c.id === creature.id)
        ? prev.filter(c => c.id !== creature.id)
        : [...prev, creature]
    )
  }

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files)
    const existingCount = existingPhotos.filter(p => !removedPhotoIds.includes(p.id)).length
    const slots = 3 - existingCount - newPhotos.length
    if (slots > 0) setNewPhotos(prev => [...prev, ...files.slice(0, slots)])
    e.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)

    const diveData = {
      date,
      location_name: locationName,
      latitude: lat,
      longitude: lng,
      comments: comments.trim() || null,
    }

    try {
      if (isEdit) {
        await updateDive({ diveId: id, diveData, selectedCreatures, newPhotos, removedPhotoIds })
        navigate(`/log/${id}`)
      } else {
        const dive = await addDive({ diveData, selectedCreatures, photos: newPhotos })
        navigate(`/log/${dive.id}`)
      }
    } catch (err) {
      console.error('Save dive error:', err)
      setFormError(err?.message ?? err?.details ?? 'Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const filteredCreatures = allCreatures.filter(c =>
    c.name.toLowerCase().includes(creatureSearch.toLowerCase())
  )

  const visibleExistingPhotos = existingPhotos.filter(p => !removedPhotoIds.includes(p.id))
  const totalPhotoCount = visibleExistingPhotos.length + newPhotos.length

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(isEdit ? `/log/${id}` : '/log')}
          className="text-gray-400 hover:text-white"
        >
          ← Back
        </button>
        <h1 className="text-white text-xl font-bold">{isEdit ? 'Edit Dive' : 'Log a Dive'}</h1>
      </div>


      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date */}
        <div>
          <label className="block text-gray-400 text-sm mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Location Name */}
        <div>
          <label className="block text-gray-400 text-sm mb-1.5">Location Name</label>
          <input
            type="text"
            value={locationName}
            onChange={e => setLocationName(e.target.value)}
            placeholder="e.g. Cozumel, Mexico"
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600"
          />
        </div>

        {/* Map Pin */}
        <div>
          <label className="block text-gray-400 text-sm mb-1.5">Pin on Map <span className="text-gray-600">(optional)</span></label>
          <LocationPicker
            lat={lat}
            lng={lng}
            onChange={({ latitude, longitude }) => { setLat(latitude); setLng(longitude) }}
          />
        </div>

        {/* Creatures */}
        <div>
          <label className="block text-gray-400 text-sm mb-1.5">
            Creatures Spotted <span className="text-gray-600">(optional)</span>
          </label>
          {selectedCreatures.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedCreatures.map(c => (
                <span
                  key={c.id}
                  className="bg-teal-950 border border-teal-800 text-teal-300 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                >
                  {c.name}
                  <button
                    type="button"
                    onClick={() => toggleCreature(c)}
                    className="text-teal-500 hover:text-white ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              placeholder="Search and select creatures..."
              value={creatureSearch}
              onChange={e => { setCreatureSearch(e.target.value); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600"
            />
          {showDropdown && (
              <div className="absolute z-20 w-full bg-gray-900 border border-gray-700 rounded-xl mt-1 max-h-52 overflow-y-auto shadow-xl">
                {filteredCreatures.length === 0 ? (
                  <p className="text-gray-500 text-sm px-4 py-3">No creatures found</p>
                ) : (
                  filteredCreatures.map(c => {
                    const selected = Boolean(selectedCreatures.find(s => s.id === c.id))
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { toggleCreature(c); setCreatureSearch('') }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 hover:bg-gray-800 transition-colors ${selected ? 'text-teal-300' : 'text-white'}`}
                      >
                        {c.image_url && (
                          <img src={c.image_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                        )}
                        <span className="flex-1">{c.name}</span>
                        {selected && <span className="text-teal-400 text-xs">✓</span>}
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-gray-400 text-sm mb-1.5">
            Photos <span className="text-gray-600">(up to 3, optional)</span>
          </label>
          {(visibleExistingPhotos.length > 0 || newPhotos.length > 0) && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {visibleExistingPhotos.map(photo => (
                <div key={photo.id} className="relative">
                  <img src={photo.photo_url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setRemovedPhotoIds(prev => [...prev, photo.id])}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black"
                  >×</button>
                </div>
              ))}
              {newPhotos.map((file, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setNewPhotos(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black"
                  >×</button>
                </div>
              ))}
            </div>
          )}
          {totalPhotoCount < 3 && (
            <label className="flex items-center justify-center h-14 bg-gray-900 border border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-teal-700 transition-colors">
              <span className="text-gray-500 text-sm">+ Add photo</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoAdd}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Comments */}
        <div>
          <label className="block text-gray-400 text-sm mb-1.5">Comments <span className="text-gray-600">(optional)</span></label>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            rows={3}
            placeholder="How was the dive?"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 resize-none"
          />
        </div>

        {formError && (
          <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Log Dive'}
        </button>
      </form>
    </div>
  )
}
