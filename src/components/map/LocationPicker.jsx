import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'

const pinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
})

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

export default function LocationPicker({ lat, lng, onChange }) {
  const center = lat != null && lng != null ? [lat, lng] : [20, 0]
  const zoom = lat != null && lng != null ? 10 : 2

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => {}
    )
  }

  return (
    <div>
      <div className="h-48 rounded-xl overflow-hidden border border-gray-700">
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <ClickHandler onPick={(lat, lng) => onChange({ latitude: lat, longitude: lng })} />
          {lat != null && lng != null && (
            <Marker position={[lat, lng]} icon={pinIcon} />
          )}
        </MapContainer>
      </div>
      <div className="flex items-center justify-between mt-2">
        <button
          type="button"
          onClick={useMyLocation}
          className="text-sm text-teal-400 hover:text-teal-300"
        >
          Use my location
        </button>
        {lat != null && lng != null && (
          <span className="text-xs text-gray-500">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
        )}
      </div>
    </div>
  )
}
