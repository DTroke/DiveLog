const LEVELS = [
  [1000, 'Expert'],
  [500, 'Pro'],
  [200, 'Advanced'],
  [100, 'Intermediate High'],
  [50, 'Intermediate'],
  [25, 'Adventurer'],
  [10, 'Explorer'],
  [0, 'Newcomer'],
]

export function getDiverLevel(diveCount) {
  for (const [threshold, label] of LEVELS) {
    if (diveCount >= threshold) return label
  }
  return 'Newcomer'
}
