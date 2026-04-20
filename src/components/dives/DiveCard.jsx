import { useNavigate } from 'react-router-dom'

export default function DiveCard({ dive, diveNumber }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/log/${dive.id}`)}
      className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-left hover:border-teal-700 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-teal-950 border border-teal-800 flex items-center justify-center flex-shrink-0">
          <span className="text-teal-300 font-bold text-sm">#{diveNumber}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{dive.location_name}</p>
          <p className="text-gray-400 text-sm">
            {new Date(dive.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {dive.dive_creatures?.length > 0 && (
              <span className="ml-2 text-teal-500">{dive.dive_creatures.length} creature{dive.dive_creatures.length !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
