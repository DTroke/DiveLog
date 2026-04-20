import { useNavigate } from 'react-router-dom'
import { useDives } from '../hooks/useDives'
import { calculateDiveNumbers } from '../lib/diveUtils'
import DiveCard from '../components/dives/DiveCard'

export default function DiveLogPage() {
  const navigate = useNavigate()
  const { dives, loading } = useDives()
  const diveNumbers = calculateDiveNumbers(dives)

  return (
    <div className="p-4 pb-6">
      <h1 className="text-white text-2xl font-bold mb-6">Dive Log</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : dives.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🤿</p>
          <p className="text-gray-400 text-lg mb-1">No dives yet</p>
          <p className="text-gray-600 text-sm">Tap + to log your first dive</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dives.map(dive => (
            <DiveCard key={dive.id} dive={dive} diveNumber={diveNumbers[dive.id]} />
          ))}
        </div>
      )}

      <button
        onClick={() => navigate('/log/new')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-teal-600 hover:bg-teal-500 rounded-full flex items-center justify-center shadow-lg text-white text-3xl leading-none transition-colors z-10"
        aria-label="Add dive"
      >
        +
      </button>
    </div>
  )
}
