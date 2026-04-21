import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatures } from '../hooks/useCreatures'
import CreatureCard from '../components/creatures/CreatureCard'

export default function PokedexPage() {
  const navigate = useNavigate()
  const { creatures, unlockedIds, loading, error } = useCreatures()
  const [search, setSearch] = useState('')
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false)

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-400">
        <p>Failed to load Pokédex. Check your connection.</p>
      </div>
    )
  }

  const unlockedCount = [...unlockedIds].filter(id =>
    creatures.some(c => c.id === id)
  ).length

  const filtered = creatures.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = !showOnlyUnlocked || unlockedIds.has(c.id)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-xl font-bold">Pokédex</h1>
          <span className="text-teal-400 text-sm font-semibold">
            {unlockedCount} / {creatures.length} spotted
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: creatures.length ? `${(unlockedCount / creatures.length) * 100}%` : '0%' }}
          />
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search creatures..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm"
        />

        {/* Toggle */}
        <button
          onClick={() => setShowOnlyUnlocked(prev => !prev)}
          className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors border ${showOnlyUnlocked ? 'bg-teal-950 border-teal-700 text-teal-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
        >
          <span className={`w-3 h-3 rounded-sm border ${showOnlyUnlocked ? 'bg-teal-500 border-teal-500' : 'border-gray-500'}`} />
          Show only spotted
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">
              {search ? 'No creatures match your search.' : 'No creatures spotted yet. Log a dive to unlock your first!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(creature => (
              <CreatureCard
                key={creature.id}
                creature={creature}
                isUnlocked={unlockedIds.has(creature.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB — add custom creature */}
      <button
        onClick={() => navigate('/pokedex/new')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-teal-600 hover:bg-teal-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-colors z-10"
        aria-label="Add custom creature"
      >
        +
      </button>
    </div>
  )
}
