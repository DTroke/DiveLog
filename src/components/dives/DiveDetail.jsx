import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { useDives } from '../../hooks/useDives'
import { calculateDiveNumbers } from '../../lib/diveUtils'

const pinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
})

export default function DiveDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dives, loading, deleteDive } = useDives()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const dive = dives.find(d => d.id === id)
  if (!dive) {
    return (
      <div className="p-4">
        <button onClick={() => navigate('/log')} className="text-teal-400 mb-4 block">← Back</button>
        <p className="text-gray-400">Dive not found.</p>
      </div>
    )
  }

  const diveNumbers = calculateDiveNumbers(dives)
  const diveNumber = diveNumbers[dive.id]

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteDive(dive.id)
      navigate('/log')
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="p-4 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/log')} className="text-gray-400 hover:text-white">
          ← Back
        </button>
        <h1 className="text-white text-xl font-bold flex-1">Dive #{diveNumber}</h1>
        <button
          onClick={() => navigate(`/log/${dive.id}/edit`)}
          className="text-teal-400 hover:text-teal-300 text-sm font-medium"
        >
          Edit
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Location</p>
          <p className="text-white font-semibold text-lg">{dive.location_name}</p>
          <p className="text-gray-400 text-sm mt-1">
            {new Date(dive.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {dive.latitude != null && dive.longitude != null && (
          <div className="h-48 rounded-xl overflow-hidden">
            <MapContainer
              center={[dive.latitude, dive.longitude]}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              scrollWheelZoom={false}
              dragging={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <Marker position={[dive.latitude, dive.longitude]} icon={pinIcon} />
            </MapContainer>
          </div>
        )}

        {dive.dive_creatures?.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">
              Creatures Spotted ({dive.dive_creatures.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {dive.dive_creatures.map(dc => (
                <div key={dc.id} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
                  {dc.creatures?.image_url && (
                    <img
                      src={dc.creatures.image_url}
                      alt={dc.creatures?.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span className="text-white text-sm">{dc.creatures?.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {dive.dive_photos?.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Photos</p>
            <div className="grid grid-cols-3 gap-2">
              {dive.dive_photos.map(photo => (
                <img
                  key={photo.id}
                  src={photo.photo_url}
                  alt="Dive photo"
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {dive.comments && (
          <div className="bg-gray-900 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Comments</p>
            <p className="text-white leading-relaxed">{dive.comments}</p>
          </div>
        )}

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-3 rounded-xl text-red-400 border border-red-900/50 hover:bg-red-950/30 transition-colors text-sm"
        >
          Delete Dive
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold text-lg mb-2">Delete this dive?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Any creatures only spotted on this dive will be locked again.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-800 text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-900 text-red-200 font-medium disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
