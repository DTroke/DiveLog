import L from 'leaflet'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useDives } from '../hooks/useDives'
import { calculateDiveNumbers } from '../lib/diveUtils'

const pinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
})

export default function MapPage() {
  const navigate = useNavigate()
  const { dives, loading } = useDives()

  const diveNumbers = useMemo(() => calculateDiveNumbers(dives), [dives])

  const groups = useMemo(() => {
    const map = new Map()
    dives.forEach(dive => {
      if (dive.latitude == null || dive.longitude == null) return
      const key = `${dive.latitude},${dive.longitude}`
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(dive)
    })
    return [...map.entries()].map(([key, group]) => {
      const [lat, lng] = key.split(',').map(Number)
      return { lat, lng, dives: group }
    })
  }, [dives])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1" style={{ height: 'calc(100vh - 4rem)' }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {groups.map(({ lat, lng, dives: groupDives }) =>
          groupDives.length === 1 ? (
            <Marker
              key={groupDives[0].id}
              position={[lat, lng]}
              icon={pinIcon}
              eventHandlers={{ click: () => navigate(`/log/${groupDives[0].id}`) }}
            />
          ) : (
            <Marker key={`${lat},${lng}`} position={[lat, lng]} icon={pinIcon}>
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>
                    {groupDives.length} dives here
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {groupDives.map(dive => (
                      <li key={dive.id} style={{ marginBottom: 4 }}>
                        <button
                          onClick={() => navigate(`/log/${dive.id}`)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0d9488',
                            cursor: 'pointer',
                            fontSize: 13,
                            textAlign: 'left',
                            padding: 0,
                            textDecoration: 'underline',
                          }}
                        >
                          Dive #{diveNumbers[dive.id]} — {dive.location_name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Popup>
            </Marker>
          )
        )}
      </MapContainer>
    </div>
  )
}
