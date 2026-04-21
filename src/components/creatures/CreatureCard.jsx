import { useNavigate } from 'react-router-dom'

export default function CreatureCard({ creature, isUnlocked }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/pokedex/${creature.id}`)}
      className="bg-gray-900 rounded-2xl overflow-hidden flex flex-col items-center p-3 gap-2 text-left hover:bg-gray-800 transition-colors w-full"
    >
      <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-800">
        {creature.image_url ? (
          <img
            src={creature.image_url}
            alt={creature.name}
            className="w-full h-full object-cover"
            style={!isUnlocked ? { filter: 'grayscale(100%) brightness(0.3)' } : undefined}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl"
            style={!isUnlocked ? { filter: 'grayscale(100%) brightness(0.3)' } : undefined}
          >
            🐠
          </div>
        )}
      </div>
      <p className="text-white text-xs font-medium text-center leading-tight line-clamp-2">
        {creature.name}
      </p>
    </button>
  )
}
